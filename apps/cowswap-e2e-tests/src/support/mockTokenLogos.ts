import type { BrowserContext, Route } from '@playwright/test'

/**
 * Stubs `cowprotocolTokenLogoUrl`'s CDN endpoint (`files.cow.fi/token-lists/images/:chainId/:address/logo.png`).
 * Real CDN, 403s for this suite's Sepolia test-token addresses (verified directly) — every URL
 * `useTokenLogoUrl` tries (chain-specific, then mainnet, then trustwallet) fails the same way, since
 * they're all keyed off the same non-listed test address, so there's no fallback URL that would ever
 * resolve to a real logo.
 *
 * Fulfilling with a fake "successful" image (e.g. a blank/transparent PNG) is worse than not mocking
 * at all: `TokenLogo`'s `onError` only fires on a genuine load failure, so a 200 response — even an
 * empty one — short-circuits its designed fallback (`SingleLetterLogo`, a letter avatar) and leaves
 * just the image wrapper's plain background color visible, i.e. a solid circle with no letter and no
 * logo. Mocking a deterministic 404 here instead keeps the real CDN's behavior (so `onError` fires and
 * `SingleLetterLogo` renders as intended) while removing the flaky real network round trip.
 */
export function mockTokenLogos(context: BrowserContext): void {
  void context.route(/files\.cow\.fi\/token-lists\/images\//i, async (route: Route) => {
    await route.fulfill({ status: 404 })
  })
}
