'use client'

import { createGlobalStyle } from 'styled-components/macro'
import { Color, Media, ThemeColorVars, UI } from '@cowprotocol/ui'

const GlobalStyles = createGlobalStyle`
${ThemeColorVars}

  html, body {
    width: 100%;
    min-height: 100vh;
    min-width: 300px;
    margin: 0;
    font-size: 62.5%;
    line-height: 10px;
    box-sizing: border-box;
    font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;

      html,
      input,
      textarea,
      button {
          font-family: inherit;
      }
  }

  *::selection {
    background: ${Color.neutral100};
    color: ${Color.neutral0};
  }

  *::-moz-selection {
    background: ${Color.neutral100};
  }

  *::-webkit-selection {
    background: ${Color.neutral100};
  }

  *::-moz-placeholder {
    line-height: revert;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  a {
    text-decoration: underline;
    cursor: pointer;
  }

  a:has(> .blank-button) {
    text-decoration: none;
  }

  h1, h2, h3, p, b, i, strong {
    margin: 0;
    line-height: 1;
  }

  ul, ol {
    font-size: 16px;
  }

  button {
    font-family: inherit;
    cursor: pointer;
    outline: 0;

    &:hover {
      background-color: var(--color-background-button-hover);
      color: var(--color-text-button-hover);
    }

    &:disabled,
    &[disabled]{
      opacity: .35;
      pointer-events: none;

      &:hover {
        opacity: .35;
      pointer-events: none;
      }
    }
  }

  input {

    &::placeholder {
      color: inherit;
      font-size: inherit;
    }

    &:focus::placeholder {
      color: transparent;
    }

    &:focus {
      border-color: ${Color.neutral0};
    }

    &:disabled {
      opacity: 0.8;
    }
  }

  .noScroll {
    overflow: hidden!important;
    position: fixed!important;
    top: 0;
  }

  .mobileOnly {
    display: none !important;

    ${Media.upToMedium()} {
      display: block !important;
    }
  }

  .hideMobile {
    ${Media.upToMedium()} {
      display: none;
    }
  }

  .container {
    margin: 0 auto;
  }

  @keyframes zoomSlideIn {
  from {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3) translate3d(0, -10px, 0);
  }

  50% {
    opacity: 1;
    transform: scale3d(1.05, 1.05, 1.05) translate3d(0, -5px, 0);
  }

  to {
    opacity: 1;
    transform: scale3d(1, 1, 1) translate3d(0, 0px, 0);
  }
}

.zoomSlideIn {
  animation-name: zoomSlideIn;
  animation-duration: 1.2s;
  animation-fill-mode: forwards;
}

span[class^='wordtag-'] {
    display: inline;
    border-radius: 28px;
    padding: 3px 16px;
  }

  .wordtag-blue {
    color: var(${UI.COLOR_BLUE_900_PRIMARY});
    background: var(${UI.COLOR_BLUE_300_PRIMARY});
  }

  .wordtag-orange {
    color: ${Color.cowfi_orange_bright};
    background: ${Color.cowfi_orange_pale};
  }

  .wordtag-purple {
    color: ${Color.cowfi_purple_bright};
    background: ${Color.cowfi_purple_dark};
  }
`
export default GlobalStyles
