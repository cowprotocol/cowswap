import { UI } from '@cowprotocol/ui'

import { createGlobalStyle } from 'styled-components/macro'

// This prevents duplicate font declarations that cause re-fetching
export const CustomGlobalStyles = createGlobalStyle`
  /* NO FONT DECLARATIONS - All fonts now handled by static CSS to prevent re-injection */

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
