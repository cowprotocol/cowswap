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
