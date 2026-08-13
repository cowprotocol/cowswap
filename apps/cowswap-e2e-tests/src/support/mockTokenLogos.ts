import type { BrowserContext, Route } from '@playwright/test'

// A minimal valid 1x1 transparent PNG — real image bytes, not a broken/error response.
const TRANSPARENT_PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

/**
 * Stubs `cowprotocolTokenLogoUrl`'s CDN endpoint (`files.cow.fi/token-lists/images/:chainId/:address/logo.png`).
 * Real CDN, never mocked before this — it 403s for this suite's Sepolia test-token addresses
 * (verified directly), which `TokenLogo`'s `onError` gracefully degrades to a single-letter avatar
 * rather than a visibly broken image, but that's still not a real logo. Mocking the first URL
 * `useTokenLogoUrl` tries (chain-specific, before the mainnet/trustwallet fallbacks) with a valid
 * image short-circuits that fallback chain entirely.
 */
export function mockTokenLogos(context: BrowserContext): void {
  void context.route(/files\.cow\.fi\/token-lists\/images\//i, async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'image/png',
      body: Buffer.from(TRANSPARENT_PNG_BASE64, 'base64'),
    })
  })
}
