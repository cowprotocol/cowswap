import { defineWalletSetup } from '@synthetixio/synpress'
import { MetaMask } from '@synthetixio/synpress/playwright'

import { CHAIN_IDS } from './constants'

import type { BrowserContext, Page } from '@playwright/test'

export const SEED_PHRASE = process.env.E2E_PW_MM_SEED ?? 'test test test test test test test test test test test junk'
export const PASSWORD = 'SynpressIsGreat'

// MetaMask shows a stack of asynchronous popovers after a network is added ("Network added
// successfully!", "You have switched to X", new-network info). In headless mode they appear
// with arbitrary delays and their backdrop intercepts clicks. Dismiss everything visible and
// only proceed once the UI has stayed quiet for ~2s.
async function dismissPopovers(page: Page): Promise<void> {
  const closeButtonSelectors = [
    '.home__new-network-added__switch-to-button',
    '.new-network-info__wrapper button.btn-primary',
    '[data-testid="popover-close"]',
  ]
  for (let quiet = 0; quiet < 4; ) {
    let clicked = false
    for (const selector of closeButtonSelectors) {
      const button = page.locator(selector).first()
      if (await button.isVisible()) {
        await button.click({ force: true, timeout: 5_000 }).catch(() => undefined)
        clicked = true
      }
    }
    if (clicked) {
      quiet = 0
    } else {
      quiet += 1
      await page.waitForTimeout(500)
    }
  }
}

function rpcUrl(chainId: number, workerId: string): string {
  // Literal default (not DEFAULT_RPC_PROXY_PORT) — keep in sync with constants.ts.
  // Synpress hashes the setup function body to locate the cache; imported identifiers
  // can be renamed differently by the CLI's esbuild vs Playwright's transform, breaking the hash.
  const port = process.env.E2E_RPC_PROXY_PORT ?? '18545'
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
    console.log(`[wallet.setup] adding network ${net.name} (${net.chainId})`)
    await dismissPopovers(walletPage as Page)
    await mm.addNetwork({
      name: net.name,
      rpcUrl: rpcUrl(net.chainId, w),
      chainId: net.chainId,
      symbol: net.symbol,
    })
  }

  await dismissPopovers(walletPage as Page)

  // Sepolia uses the real RPC URL (forwarded transactions/receipts go straight to Sepolia).
  await mm.addNetwork({
    name: 'Sepolia',
    rpcUrl: process.env.REACT_APP_NETWORK_URL_11155111 ?? 'https://1rpc.io/sepolia',
    chainId: CHAIN_IDS.SEPOLIA,
    symbol: 'ETH',
  })

  await dismissPopovers(walletPage as Page)
  await mm.switchNetwork('Sepolia')
})
