import { createGlobalStyle, ThemeProvider } from 'styled-components/macro'

import { UI } from '../libs/ui/src/enum'
import { baseTheme } from '../libs/ui/src/theme/baseTheme'
import { ThemeColorVars } from '../libs/ui/src/theme/ThemeColorVars'

import type { Preview } from '@storybook/react-vite'

type StorybookThemeMode = 'dark' | 'light'

function getNumberArg(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value)

    if (Number.isFinite(parsedValue)) {
      return parsedValue
    }
  }

  return fallback
}

const StorybookGlobalStyle = createGlobalStyle`
  ${ThemeColorVars}

  html,
  body,
  #storybook-root {
    margin: 0;
    padding: 0;
  }

  html,
  body,
  input,
  textarea,
  button {
    font-family: var(${UI.FONT_FAMILY_PRIMARY}), Arial, sans-serif;
  }

  body {
    min-height: 100vh;
    background: var(${UI.COLOR_NEUTRAL_98});
    color: var(${UI.COLOR_TEXT});
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  a {
    color: inherit;
  }

  button {
    user-select: none;
  }

  .docs-story {
    padding: 0;
    background: transparent;
    border-radius: inherit;
    overflow: hidden;
  }
`

const preview: Preview = {
  globalTypes: {
    themeMode: {
      name: 'Theme',
      description: 'Global theme for component previews.',
      toolbar: {
        icon: 'mirror',
        items: [
          { title: 'Light', value: 'light' },
          { title: 'Dark', value: 'dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    themeMode: 'light',
  },
  decorators: [
    (Story, context) => {
      const previewWidth = getNumberArg(context.args.previewWidth, 960)
      const previewMinHeight = getNumberArg(context.args.previewMinHeight, 240)
      const themeMode: StorybookThemeMode = context.globals.themeMode === 'dark' ? 'dark' : 'light'
      const storybookTheme = baseTheme(themeMode)
      const sharedPreviewStyle = {
        maxWidth: `${previewWidth}px`,
        width: '100%',
        margin: '0 auto',
        minHeight: `${previewMinHeight}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      } as const

      return (
        <ThemeProvider theme={storybookTheme}>
          <StorybookGlobalStyle />
          <div
            style={{
              minHeight: context.viewMode === 'docs' ? 'auto' : '100vh',
              padding: context.viewMode === 'docs' ? '0' : '24px',
              background: context.viewMode === 'docs' ? 'transparent' : `var(${UI.COLOR_NEUTRAL_98})`,
            }}
          >
            {context.viewMode === 'docs' ? (
              <div
                style={{
                  padding: '24px',
                  background: 'var(--cow-color-paper)',
                  borderRadius: '0 0 12px 12px',
                }}
              >
                <div style={sharedPreviewStyle}>
                  <Story />
                </div>
              </div>
            ) : (
              <div
                style={{
                  ...sharedPreviewStyle,
                  padding: '24px',
                  borderRadius: '20px',
                  background: 'var(--cow-color-paper)',
                  boxShadow: 'var(--cow-box-shadow)',
                  border: '1px solid var(--cow-color-text-opacity-10)',
                }}
              >
                <Story />
              </div>
            )}
          </div>
        </ThemeProvider>
      )
    },
  ],
  parameters: {
    layout: 'padded',
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
