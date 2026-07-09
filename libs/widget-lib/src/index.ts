export { createCowSwapWidget } from './cowSwapWidget'
export {
  WIDGET_CONTAINER_ID,
  WIDGET_IFRAME_ALLOW,
  WIDGET_IFRAME_ID,
  WIDGET_IFRAME_REFERRER_POLICY,
  WIDGET_IFRAME_SANDBOX,
} from './cowSwapWidget.constants'
export type { CowSwapWidgetHandler } from './cowSwapWidget'
export { resolveFlexibleConfigValues } from './resolveFlexibleConfigValues'
export { sanitizeWidgetBaseUrl, SHOULD_THROW_IF_INVALID_URL } from './urlUtils'
export { widgetIframeTransport } from './widgetIframeTransport'

export * from './types'
export * from './themeUtils'
export * from './flexibleConfig'

// If a hooks dApp lib is using `@cowprotocol/iframe-transport`, ideally they don't need to install an additional
// dependency (`@cowprotocol/types`) or use utility types to extract types used by some of the entities exported from
// this lib.
export type { HttpsUrlString, HttpUrlString, UrlString } from '@cowprotocol/iframe-transport'
