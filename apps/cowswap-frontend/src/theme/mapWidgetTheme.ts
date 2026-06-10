import type { CowSwapWidgetPalette } from '@cowprotocol/widget-lib'

import { DefaultTheme } from 'styled-components/macro'

/**
 * Map the provided data from consumer to styled-components theme.
 *
 * Layout and shell styling (padding, border radius, iframe shadow) now live in
 * `iframeStyle`, `bodyWrapperStyle`, and `cardStyle` instead of the palette.
 *
 * Keep the legacy `boxShadow` to `boxShadow1` mapping to avoid breaking live integrations.
 */
export function mapWidgetTheme(
  widgetTheme: Partial<CowSwapWidgetPalette> | undefined,
  defaultTheme: DefaultTheme,
): DefaultTheme {
  if (!widgetTheme) return defaultTheme

  const { boxShadow, ...widgetPalette } = widgetTheme as Partial<CowSwapWidgetPalette> & { boxShadow?: string }

  return {
    ...defaultTheme,
    ...widgetPalette,
    ...(widgetPalette.paper ? { buttonTextCustom: widgetPalette.paper } : null),
    ...(boxShadow ? { boxShadow1: boxShadow } : null),
  }
}
