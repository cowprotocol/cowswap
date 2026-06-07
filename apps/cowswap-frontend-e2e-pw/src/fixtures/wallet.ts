import { CHAIN_IDS, type SupportedChainId } from '../support/constants'

import type { Page } from '@playwright/test'
import type { MetaMask } from '@synthetixio/synpress/playwright'

const CHAIN_NAME_BY_ID: Record<SupportedChainId, string> = {
  [CHAIN_IDS.MAINNET]: 'Mainnet',
  [CHAIN_IDS.ARBITRUM]: 'Arbitrum',
  [CHAIN_IDS.BASE]: 'Base',
  [CHAIN_IDS.BNB]: 'BNB',
  [CHAIN_IDS.GNOSIS]: 'Gnosis',
  [CHAIN_IDS.SEPOLIA]: 'Sepolia',
}

function resolveChainName(chainId: SupportedChainId): string {
  const chainName = CHAIN_NAME_BY_ID[chainId]
  if (!chainName) {
    throw new Error(`Unsupported chainId: ${chainId}`)
  }
  return chainName
}

export interface WalletApi {
  readonly address: string
  connectAsEOA(opts: { chainId: SupportedChainId }): Promise<void>
  switchChain(chainId: SupportedChainId): Promise<void>
  confirmSignTypedData(): Promise<void>
  rejectSignTypedData(): Promise<void>
  approveToken(): Promise<void>
}

export function createWalletApi(metamask: MetaMask, page: Page): WalletApi {
  let cachedAddress = ''

  return {
    get address() {
      return cachedAddress
    },
    async connectAsEOA({ chainId }) {
      const chainName = resolveChainName(chainId)
      await metamask.switchNetwork(chainName)
      // Open the app on the target chain BEFORE connecting. AppKit's defaultNetwork is fixed at
      // module-eval time from the URL chain (libs/wallet config.ts) and falls back to Mainnet;
      // on connect it pushes that network to the wallet via wallet_switchEthereumChain — a
      // MetaMask prompt that connectToDapp() does not handle. The synpress page fixture already
      // loaded "/" (Mainnet), and a hash-only goto does not re-evaluate modules — force a full
      // document load at the chain URL so AppKit initializes on the target chain.
      await page.goto(`/#/${chainId}/swap`)
      // AppKit also persists its active network in localStorage during the initial load at "/"
      // (eip155:1) and restores it on init, overriding defaultNetwork — pin it to the target
      // chain so the reloaded app comes up with wallet chain == app chain on every layer.
      await page.evaluate((cid) => localStorage.setItem('@appkit/active_caip_network_id', `eip155:${cid}`), chainId)
      await page.reload()
      await page.getByRole('button', { name: /connect wallet/i }).click()
      await page.getByRole('button', { name: /metamask/i }).click()
      await metamask.connectToDapp()
      cachedAddress = await metamask.getAccountAddress()
    },
    async switchChain(chainId) {
      const chainName = resolveChainName(chainId)
      await metamask.switchNetwork(chainName)
    },
    async confirmSignTypedData() {
      await metamask.confirmSignature()
    },
    async rejectSignTypedData() {
      await metamask.rejectSignature()
    },
    async approveToken() {
      await metamask.approveTokenPermission()
    },
  }
}
