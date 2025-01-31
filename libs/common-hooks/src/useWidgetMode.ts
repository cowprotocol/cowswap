import { isInjectedWidget } from '@cowprotocol/common-utils'
import { WidgetThemeMode } from '@cowprotocol/types'

export function useWidgetMode(): WidgetThemeMode {
  const isWidget = isInjectedWidget()
  const isIframe = window.self !== window.top
  const isStandalone = !isWidget && !isIframe
  const isInjectedWidgetMode = isWidget

  return {
    isInjectedWidgetMode,
    isStandalone,
    isWidget,
    isIframe,
  }
}
