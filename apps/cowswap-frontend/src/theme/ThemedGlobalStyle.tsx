import { Color, Media, ThemeColorVars, UI } from '@cowprotocol/ui'

import { createGlobalStyle } from 'styled-components/macro'

export const ThemedGlobalStyle = createGlobalStyle`
  ${ThemeColorVars}

  html,
  input,
  textarea,
  button {
    font-family: 'Inter', sans-serif;
  }
  @supports (font-variation-settings: normal) {
    html,
    input,
    textarea,
    button {
      font-family: 'Inter var', sans-serif;
    }
  }

  html,
  body {
    margin: 0;
    padding: 0;
  }

  body {
    background: transparent;
  }

  a {
    color: ${({ theme }) => theme.blue1};
  }

  * {
    box-sizing: border-box;
  }

  button {
    user-select: none;
  }

  html {
    font-size: 16px;
    font-variant: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
  }

  html {
    background-color: ${({ theme }) =>
      theme.isInjectedWidgetMode ? 'transparent' : `var(${UI.COLOR_CONTAINER_BG_02})`};
  }

  *, *:after, *:before {
    box-sizing: border-box;
  }

  body {
    background: ${({ theme }) => (theme?.isInjectedWidgetMode ? 'transparent' : Color.neutral98)};
    min-height: ${({ theme }) => (theme.isInjectedWidgetMode ? 'auto' : '100vh')};

    &.noScroll {
      overflow: hidden;
    }
  }

  ::selection {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
  }

  // TODO: Can be removed once we control this component
  [data-reach-dialog-overlay] {
    z-index: 10 !important;

    ${Media.upToMedium()} {
      top: 0 !important;
      bottom: 0 !important;
    }
  }

  // Walletconnect V2 mobile override
  body #wcm-modal.wcm-overlay {
    ${Media.upToSmall()} {
      align-items: flex-start;
    }

    a {
      text-decoration: none;

      :hover {
        text-decoration: underline;
      }
    }
  }

  body {
    font-family: 'studiofeixen', Arial, sans-serif;
    margin: 0;
    padding: 0;
    background: transparent;
    color: var(${UI.COLOR_TEXT});
    scroll-behavior: smooth;
    font-variant: none;
    font-variant-ligatures: none;
    text-rendering: optimizeLegibility;
    font-feature-settings:
      'liga' off,
      'kern' on;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  a {
    color: inherit;
  }
`
