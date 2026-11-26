import { getWidgetBaseUrl } from './widget'

type PageLocation = Pick<Location, 'hostname' | 'origin'>

const PROD_EXPLORER_BASE_URL = 'https://explorer.cow.fi'
const STAGING_EXPLORER_BASE_URL = 'https://staging.explorer.cow.fi'
const DEV_EXPLORER_BASE_URL = 'https://dev.explorer.cow.fi'

/**
 * The CoW Explorer that the widget the page loads (`getWidgetBaseUrl`) links to, as `explorer.ts` of
 * `@cowprotocol/common-utils`: prod for `swap.cow.fi` and the production widget, staging for `staging.swap.cow.fi`,
 * dev for the other CoW Swap environments, the `swap-dev` previews and the local CoW Swap
 */
export function getExplorerBaseUrl(location: PageLocation | undefined): string {
  const widgetBaseUrl = getWidgetBaseUrl(location)
  if (!widgetBaseUrl) return PROD_EXPLORER_BASE_URL

  const { hostname } = new URL(widgetBaseUrl)
  if (hostname === 'swap.cow.fi') return PROD_EXPLORER_BASE_URL
  if (hostname === 'staging.swap.cow.fi') return STAGING_EXPLORER_BASE_URL

  return DEV_EXPLORER_BASE_URL
}

/** `getExplorerBaseUrl` of the current page */
export function getPageExplorerBaseUrl(): string {
  return getExplorerBaseUrl(typeof window === 'undefined' ? undefined : window.location)
}
