import path from 'path'

import type { BrowserContext, Route } from '@playwright/test'

const BUILD_CUSTOM_HOOK_LOGO_PATH = path.resolve(
  __dirname,
  '../../../cowswap-frontend/src/modules/hooksStore/dapps/BuildHookApp/build.png',
)

/**
 * Stubs `hookDappsRegistry.ts`'s `BUILD_CUSTOM_HOOK.image` — a `raw.githubusercontent.com` URL with no
 * test-side mock and no frontend-side `onError` fallback (`HookItem` just renders `<img src={...} />`
 * with nothing to show if the request fails). Any hiccup reaching GitHub from the test runner renders a
 * bare placeholder box instead of the hook's hard-hat icon. Fulfilling from the same `build.png` already
 * checked into the frontend source removes that live network dependency entirely.
 */
export function mockHookLogo(context: BrowserContext): void {
  void context.route(
    /raw\.githubusercontent\.com\/cowprotocol\/cowswap\/.*\/BuildHookApp\/build\.png/i,
    async (route: Route) => {
      await route.fulfill({ status: 200, contentType: 'image/png', path: BUILD_CUSTOM_HOOK_LOGO_PATH })
    },
  )
}
