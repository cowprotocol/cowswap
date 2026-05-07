/* eslint-disable @nx/enforce-module-boundaries */
import { createGlobalStyle, ThemeProvider } from 'styled-components/macro'

import { Color } from '../../../libs/ui/src/colors'
import { UI } from '../../../libs/ui/src/enum'
import { baseTheme } from '../../../libs/ui/src/theme/baseTheme'
import { ThemeColorVars } from '../../../libs/ui/src/theme/ThemeColorVars'

import type { Preview } from '@storybook/react-vite'

type ThemeMode = 'dark' | 'light'

function getCowswapBackground(themeMode: ThemeMode): string {
  return themeMode === 'dark' ? '#0E0F2D' : `var(${UI.COLOR_BLUE_300_PRIMARY})`
}

const GlobalStyle = createGlobalStyle<{ $themeMode: ThemeMode }>`
  ${ThemeColorVars}

  .sb-show-main {
    background-color: #fff;
    background-image: repeating-conic-gradient(
      from 90deg,
      rgb(255, 255, 255) 0%,
      rgb(255, 255, 255) 25%,
      rgb(226, 226, 226) 0%,
      rgb(226, 226, 226) 50%
    );
    background-size: 20px 20px;
  }

  body {
    color: var(${UI.COLOR_TEXT});
    font-family: var(${UI.FONT_FAMILY_PRIMARY}), Arial, sans-serif;
    --storybook-cowswap-background: ${({ $themeMode }) => getCowswapBackground($themeMode)};
  }
`

const preview: Preview = {
  globalTypes: {
    themeMode: {
      name: 'Theme',
      description: 'Theme mode for components',
      toolbar: {
        icon: 'mirror',
        items: [
          { title: 'Light', value: 'light' as ThemeMode },
          { title: 'Dark', value: 'dark' as ThemeMode },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    themeMode: 'light' as ThemeMode,
  },
  decorators: [
    (Story, context) => {
      const themeMode: ThemeMode = context.globals.themeMode === 'dark' ? 'dark' : 'light'
      const theme = baseTheme(themeMode)

      return (
        <ThemeProvider theme={theme}>
          <GlobalStyle $themeMode={themeMode} />
          <Story />
        </ThemeProvider>
      )
    },
  ],
  parameters: {
    layout: 'padded',
    backgrounds: {
      options: {
        paperAuto: { name: 'Paper auto', value: `var(${UI.COLOR_PAPER})` },
        swapAuto: { name: 'Swap auto', value: 'var(--storybook-cowswap-background)' },
        light: { name: 'Light', value: '#F8F8F8' },
        paperLight: { name: 'Paper light', value: Color.white },
        swapLight: { name: 'Swap light', value: `var(${UI.COLOR_BLUE_300_PRIMARY})` },
        dark: { name: 'Dark', value: '#333333' },
        paperDark: { name: 'Paper dark', value: Color.paperDark },
        swapDark: { name: 'Swap dark', value: '#0E0F2D' },
      },
    },
    docs: {
      codePanel: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
}

export default preview
