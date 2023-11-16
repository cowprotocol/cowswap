import type { CowSwapWidgetPalette } from '@cowprotocol/widget-lib'

import { css, DefaultTheme } from 'styled-components/macro'

// Map the provided data from consumer to styled-components theme
export function mapWidgetTheme(
  widgetTheme: CowSwapWidgetPalette | undefined,
  defaultTheme: DefaultTheme
): DefaultTheme {
  if (!widgetTheme) return defaultTheme

  return {
    ...defaultTheme,
    bg3: widgetTheme.paper,
    bg4: widgetTheme.paper,
    cardBackground: widgetTheme.paper,
    text1: widgetTheme.text,
    primary1: widgetTheme.primary,
    primary2: widgetTheme.primary,
    primary3: widgetTheme.primary,
    primary4: widgetTheme.primary,
    bg2: widgetTheme.primary,
    body: {
      ...defaultTheme.body,
      background: css`
        background-color: ${widgetTheme.paper};
        background-image: none;
      `,
    },
  }
}
