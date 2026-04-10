export { createCowSwapWidget } from './cowSwapWidget'
export { widgetIframeTransport } from './widgetIframeTransport'
export type { CowSwapWidgetHandler } from './cowSwapWidget'
export { resolveFlexibleConfigValues } from './resolveFlexibleConfigValues'

export * from './types'
export * from './themeUtils'
export * from './flexibleConfig'

// If a hooks dApp lib is using `@cowprotocol/iframe-transport`, ideally they don't need to install an additional
// dependency (`@cowprotocol/types`) or use utility types to extract types used by some of the entities exported from
// this lib.
export type { HttpsUrlString, HttpUrlString, UrlString } from '@cowprotocol/iframe-transport'
