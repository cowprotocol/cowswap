import type { BrowserContext } from '@playwright/test'

// A 1x1 transparent PNG — enough to satisfy a `naturalWidth > 0` check; the hook dapp icon's actual
// pixel content is never asserted on, only that the `<img>` genuinely loaded something.
const PLACEHOLDER_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
  'base64',
)

/**
 * Stubs `hookDappsRegistry.ts`'s `BUILD_CUSTOM_HOOK.image` — a real, unmocked
 * `raw.githubusercontent.com/cowprotocol/cowswap/.../BuildHookApp/build.png` URL that
 * `HookListItem`/`HookItem` both render an `<img>` for. Keeps the test off real network instead of
 * depending on GitHub's raw-content CDN staying reachable.
 */
export async function mockHookLogo(context: BrowserContext): Promise<void> {
  await context.route(/raw\.githubusercontent\.com\/.*BuildHookApp\/build\.png/i, async (route) => {
    await route.fulfill({ status: 200, contentType: 'image/png', body: PLACEHOLDER_PNG })
  })
}
