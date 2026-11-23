import type { CowEnv } from '@cowprotocol/cow-sdk'

import { getWidgetBaseUrl } from './widget'

type PageLocation = Pick<Location, 'hostname' | 'origin'>

/** CoW Swap environments on the prod backend, as `isBarnBackendEnv` of `@cowprotocol/common-utils` */
const PROD_BACKEND_HOST = /^(?:staging\.)?swap\.cow\.fi$/

/** CoW Swap's `localStorage` switches of the order book, read by `environments.ts` of `@cowprotocol/common-utils` */
const FORCE_PROD_API_KEY = 'forceProdApi'
const FORCE_STAGING_API_KEY = 'forceStagingApi'

/**
 * The CoW backend of the widget the page loads (`getWidgetBaseUrl`), so the account shows the orders it places:
 * prod for `swap.cow.fi`, `staging.swap.cow.fi` and the production widget, barn (`staging`) for `dev.swap.cow.fi`,
 * the `swap-dev` previews and the local CoW Swap. `forcedEnv` applies only to a widget on the page's origin,
 * which shares the page's `localStorage`.
 */
export function getBackendEnv(location: PageLocation | undefined, forcedEnv: CowEnv | null = null): CowEnv {
  const widgetBaseUrl = getWidgetBaseUrl(location)
  if (!widgetBaseUrl) return 'prod'

  const widgetUrl = new URL(widgetBaseUrl)
  if (forcedEnv && widgetUrl.origin === location?.origin) return forcedEnv

  return PROD_BACKEND_HOST.test(widgetUrl.hostname) ? 'prod' : 'staging'
}

/** `getBackendEnv` of the current page, with CoW Swap's `forceProdApi` and `forceStagingApi` switches */
export function getPageBackendEnv(): CowEnv {
  if (typeof window === 'undefined') return getBackendEnv(undefined)

  return getBackendEnv(window.location, getForcedBackendEnv())
}

function getForcedBackendEnv(): CowEnv | null {
  try {
    if (window.localStorage.getItem(FORCE_PROD_API_KEY)) return 'prod'
    if (window.localStorage.getItem(FORCE_STAGING_API_KEY)) return 'staging'
  } catch {
    // localStorage throws when the browser blocks site data
  }

  return null
}
