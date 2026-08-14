import type { BrowserContext, Route } from '@playwright/test'

// This suite's Sepolia test-token deployments (`WETH`/`USDC` in `market-orders.spec.ts`) aren't on
// any token list, so every URL `useTokenLogoUrl` tries — keyed off these same addresses on every
// chain it checks — 403s against the real CDN (verified directly). Redirecting to each token's real
// mainnet counterpart resolves to the actual brand icon instead of a broken image or a letter avatar.
const REAL_MAINNET_ADDRESS: Record<string, string> = {
  '0xfff9976782d46cc05630d1f6ebab18b2324d6b14': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
  '0xbe72e441bf55620febc26715db68d3494213d8cb': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
}

const LOGO_PATH_RE = /\/token-lists\/images\/\d+\/(0x[a-fA-F0-9]{40})\/logo\.png$/i

/**
 * Stubs `cowprotocolTokenLogoUrl`'s CDN endpoint (`files.cow.fi/token-lists/images/:chainId/:address/logo.png`)
 * for this suite's test-token addresses, redirecting each to its real mainnet counterpart's logo
 * (same technique as `route.fetch()`'s upstream-merge helpers elsewhere in this folder, just fetching
 * a different URL instead of the same one). Anything not in `REAL_MAINNET_ADDRESS` falls back to a
 * plain 404, matching the real CDN's own behavior for an unlisted token — that keeps `TokenLogo`'s
 * `onError` fallback (`SingleLetterLogo`) intact rather than masking it with a fake "successful" image.
 */
export function mockTokenLogos(context: BrowserContext): void {
  void context.route(/files\.cow\.fi\/token-lists\/images\//i, async (route: Route) => {
    const match = new URL(route.request().url()).pathname.match(LOGO_PATH_RE)
    const realAddress = match && REAL_MAINNET_ADDRESS[match[1].toLowerCase()]

    if (!realAddress) {
      await route.fulfill({ status: 404 })
      return
    }

    try {
      const response = await route.fetch({ url: `https://files.cow.fi/token-lists/images/1/${realAddress}/logo.png` })
      await route.fulfill({ response })
    } catch {
      await route.fulfill({ status: 404 })
    }
  })
}
