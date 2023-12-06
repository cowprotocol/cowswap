import type { CowSwapWidgetPalette } from '@cowprotocol/widget-lib'

import {
  // css,
  DefaultTheme,
} from 'styled-components/macro'

// Map the provided data from consumer to styled-components theme
export function mapWidgetTheme(
  widgetTheme: CowSwapWidgetPalette | undefined,
  defaultTheme: DefaultTheme
): DefaultTheme {
  if (!widgetTheme) return defaultTheme

  return {
    ...defaultTheme,
    primary: widgetTheme.primary,
    background: widgetTheme.background,
    paper: widgetTheme.paper,
    text: widgetTheme.text,
    alert: widgetTheme.alert,
    warning: widgetTheme.warning,
    success: widgetTheme.success,
    info: widgetTheme.info,
    danger: widgetTheme.danger,
  }
}
