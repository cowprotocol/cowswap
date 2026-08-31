import { baseGlobalStyles, Media, ThemeColorVars, UI } from '@cowprotocol/ui'

import { createGlobalStyle } from 'styled-components/macro'

import { Z_INDEX } from './consts'

export const ThemedGlobalStyle = createGlobalStyle`
  ${ThemeColorVars}
  ${baseGlobalStyles}

  ::selection {
    background: var(${UI.COLOR_PRIMARY});
    color: var(${UI.COLOR_BUTTON_TEXT});
  }

  html {
    font-family: var(${UI.FONT_FAMILY_PRIMARY});
    font-size: 16px;
    font-variant: none;
    font-variant-ligatures: none;
    text-rendering: optimizeLegibility;
    font-feature-settings:
      'liga' off,
      'kern' on,
      'ss01' on,
      'ss02' on,
      'cv01' on,
      'cv03' on;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    color: var(${UI.COLOR_TEXT_PAPER});
    background-color: ${({ theme }) => (theme.isWidget ? 'transparent' : `var(${UI.COLOR_CONTAINER_BG_02})`)};
  }

  body {
    background: transparent;
    min-height: ${({ theme }) => (theme.isWidget ? 'auto' : '100vh')};

    /* Keep the lock on <body>; making <html> an overflow container shifts sticky mobile controls. */
    &.noScroll {
      overflow: hidden;
    }
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
`
