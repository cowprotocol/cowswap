import { baseGlobalStyles, Media, ThemeColorVars, UI } from '@cowprotocol/ui'

import { createGlobalStyle } from 'styled-components/macro'

import { Z_INDEX } from './consts'

export const ThemedGlobalStyle = createGlobalStyle`
  ${ThemeColorVars}
  ${baseGlobalStyles}

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
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
  }

  html {
    background-color: ${({ theme }) => (theme.isWidget ? 'transparent' : `var(${UI.COLOR_CONTAINER_BG_02})`)};
  }

  *, *:after, *:before {
    box-sizing: border-box;
  }

  body {
    background: ${({ theme }) => (theme.isWidget ? 'transparent' : `var(${UI.COLOR_NEUTRAL_98})`)};
    min-height: ${({ theme }) => (theme.isWidget ? 'auto' : '100vh')};

    &.noScroll {
      overflow: hidden;
    }
  }

  ::selection {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
  }

  // TODO: Can be removed once we control this component
  // Must stay at/above Dialog (1060) so Reach modals are not covered by Base UI overlays
  [data-reach-dialog-overlay] {
    z-index: ${Z_INDEX.modal} !important;

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
    font-family: var(${UI.FONT_FAMILY_PRIMARY}), Arial, sans-serif;
    background: transparent;
    color: var(${UI.COLOR_TEXT});
    font-variant: none;
    font-variant-ligatures: none;
    text-rendering: optimizeLegibility;
    font-feature-settings:
      'liga' off,
      'kern' on;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  h1, h2, h3, h4, h5, h6 {
    margin: 0;
  }

  a {
    color: inherit;
  }
`
