import type { BrowserContext } from '@playwright/test'

// Same placeholder as `mockHookLogo.ts` — nothing in this suite asserts on a token logo's actual
// pixel content, only that the image request doesn't escape to real network.
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

/**
 * Stubs the token-logo fallbacks `getTokenLogoUrls.ts` tries for every currency panel: CoW's own
 * CDN (`cowprotocolTokenLogoUrl` — `files.cow.fi/token-lists/images/<chainId>/<address>/logo.png`,
 * a real endpoint that 403s for this suite's fake test-token addresses) and, once that fails, the
 * Trustwallet raw-GitHub fallback (`trustTokenLogoUrl`) it falls through to next.
 */
export async function mockTokenLogos(context: BrowserContext): Promise<void> {
  await context.route(/files\.cow\.fi\/token-lists\/images\//i, async (route) => {
    await route.fulfill({ status: 200, contentType: 'image/png', body: PLACEHOLDER_PNG })
  })
  await context.route(/raw\.githubusercontent\.com\/trustwallet\/assets\//i, async (route) => {
    await route.fulfill({ status: 200, contentType: 'image/png', body: PLACEHOLDER_PNG })
  })
}
