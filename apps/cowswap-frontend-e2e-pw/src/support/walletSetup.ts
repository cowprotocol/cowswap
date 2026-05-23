import { defineWalletSetup } from '@synthetixio/synpress'
import { MetaMask } from '@synthetixio/synpress/playwright'

import { CHAIN_IDS } from './constants'

import type { BrowserContext, Page } from '@playwright/test'

export const SEED_PHRASE = process.env.E2E_PW_MM_SEED ?? 'test test test test test test test test test test test junk'
export const PASSWORD = 'SynpressIsGreat'

function rpcUrl(chainId: number, workerId: string): string {
  const port = process.env.E2E_RPC_PROXY_PORT ?? '0'
  return `http://127.0.0.1:${port}/rpc/${chainId}/${workerId}`
}

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // `@synthetixio/synpress-cache` resolves `BrowserContext`/`Page` against `playwright-core@1.48.2`,
  // while `MetaMask` from `@synthetixio/synpress-metamask` resolves them against `@playwright/test@1.49.1`.
  // The shapes are structurally identical; cast to the `MetaMask` constructor's expected types.
  const mm = new MetaMask(context as BrowserContext, walletPage as Page, PASSWORD)
  await mm.importWallet(SEED_PHRASE)

  // Worker partition for the cache snapshot — overridden per worker at runtime via the proxy path.
  const w = 'w0'

  const networks = [
    { name: 'Mainnet', chainId: CHAIN_IDS.MAINNET, symbol: 'ETH' },
    { name: 'Arbitrum', chainId: CHAIN_IDS.ARBITRUM, symbol: 'ETH' },
    { name: 'Base', chainId: CHAIN_IDS.BASE, symbol: 'ETH' },
    { name: 'BNB', chainId: CHAIN_IDS.BNB, symbol: 'BNB' },
    { name: 'Gnosis', chainId: CHAIN_IDS.GNOSIS, symbol: 'ETH' },
  ] as const

  for (const net of networks) {
    await mm.addNetwork({
      name: net.name,
      rpcUrl: rpcUrl(net.chainId, w),
      chainId: net.chainId,
      symbol: net.symbol,
    })
  }

  // Sepolia uses the real RPC URL (forwarded transactions/receipts go straight to Sepolia).
  await mm.addNetwork({
    name: 'Sepolia',
    rpcUrl: process.env.REACT_APP_NETWORK_URL_11155111 ?? 'https://1rpc.io/sepolia',
    chainId: CHAIN_IDS.SEPOLIA,
    symbol: 'ETH',
  })

  await mm.switchNetwork('Sepolia')
})
