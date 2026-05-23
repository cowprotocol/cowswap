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
