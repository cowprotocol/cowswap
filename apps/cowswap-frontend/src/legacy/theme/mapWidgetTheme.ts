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

  console.log('defaultTheme', defaultTheme)
  console.log('widgetTheme', widgetTheme)

  return {
    ...defaultTheme,
    primary: widgetTheme.primary,
    secondary: widgetTheme.secondary,
    background: widgetTheme.background,
    paper: widgetTheme.paper,
    text: widgetTheme.text,
    warning: widgetTheme.warning,
    success: widgetTheme.success,
    info: widgetTheme.info,
    danger: widgetTheme.danger,

    // bg3: widgetTheme.paper,
    // bg4: widgetTheme.paper,
    // cardBackground: widgetTheme.paper,
    // text1: widgetTheme.text,
    // primary1: widgetTheme.primary,
    // primary2: widgetTheme.primary,
    // primary3: widgetTheme.primary,
    // primary4: widgetTheme.primary,
    // bg2: widgetTheme.primary,
    // body: {
    //   ...defaultTheme.body,
    //   background: css`
    //     background-color: ${widgetTheme.paper};
    //     background-image: none;
    //   `,
    // },
  }
}
