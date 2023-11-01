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
    bg3: widgetTheme.widgetBackground,
    bg4: widgetTheme.widgetBackground,
    cardBackground: widgetTheme.widgetBackground,
    text1: widgetTheme.textColor,
    primary1: widgetTheme.primaryColor,
    primary2: widgetTheme.primaryColor,
    primary3: widgetTheme.primaryColor,
    primary4: widgetTheme.primaryColor,
    bg2: widgetTheme.primaryColor,
    body: {
      ...defaultTheme.body,
      background: css`
        background-color: ${widgetTheme.screenBackground};
        background-image: none;
      `,
    },
  }
}
