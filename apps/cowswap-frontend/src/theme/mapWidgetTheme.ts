import type { CowSwapWidgetPalette } from '@cowprotocol/widget-lib'

import { DefaultTheme } from 'styled-components/macro'

// Map the provided data from consumer to styled-components theme
export function mapWidgetTheme(
  widgetTheme: Partial<CowSwapWidgetPalette> | undefined,
  defaultTheme: DefaultTheme,
): DefaultTheme {
  if (!widgetTheme) return defaultTheme

  const { boxShadow, widgetPadding, widgetBorderRadius, ...widgetPalette } = widgetTheme

  return {
    ...defaultTheme,
    ...widgetPalette,
    ...(widgetPalette.paper ? { buttonTextCustom: widgetPalette.paper } : null),
    ...(boxShadow ? { boxShadow1: boxShadow } : null),
    ...(widgetPadding ? { widgetPadding } : null),
    ...(widgetBorderRadius ? { widgetBorderRadius } : null),
  }
}
