// These values are static and don't change during runtime
import { isIframe, isInjectedWidget } from '@cowprotocol/common-utils'
import { baseTheme } from '@cowprotocol/ui'

import { CoWSwapTheme } from 'styled-components'

const isWidget = isInjectedWidget()
const widgetMode = {
  isWidget,
  isIframe: isIframe(),
  // TODO: isInjectedWidgetMode is deprecated, use isWidget instead
  // This alias is kept for backward compatibility with styled components
  isInjectedWidgetMode: isWidget,
}

export function getCowswapTheme(darkmode: boolean): CoWSwapTheme {
  return {
    ...baseTheme(darkmode ? 'dark' : 'light'),
    ...widgetMode,
  }
}
