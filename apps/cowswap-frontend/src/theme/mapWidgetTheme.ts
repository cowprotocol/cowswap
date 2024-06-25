import type { CowSwapWidgetPalette } from '@cowprotocol/widget-lib'

import { DefaultTheme } from 'styled-components/macro'

// Map the provided data from consumer to styled-components theme
export function mapWidgetTheme(
  widgetTheme: Partial<CowSwapWidgetPalette> | undefined,
  defaultTheme: DefaultTheme
): DefaultTheme {
  if (!widgetTheme) return defaultTheme

  return {
    ...defaultTheme,
    ...widgetTheme,
    ...(widgetTheme.paper ? { buttonTextCustom: widgetTheme.paper } : null),
  }
}
