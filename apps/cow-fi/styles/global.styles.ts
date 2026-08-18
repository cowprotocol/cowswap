'use client'

import FONT_STUDIO_FEIXEN_BOLD from '@cowprotocol/assets/fonts/StudioFeixenSans-Bold.woff2'
import FONT_STUDIO_FEIXEN_MEDIUM from '@cowprotocol/assets/fonts/StudioFeixenSans-Medium.woff2'
import FONT_STUDIO_FEIXEN_REGULAR from '@cowprotocol/assets/fonts/StudioFeixenSans-Regular.woff2'
import FONT_STUDIO_FEIXEN_SEMIBOLD from '@cowprotocol/assets/fonts/StudioFeixenSans-Semibold.woff2'
import FONT_STUDIO_FEIXEN_SERIF_BOLD from '@cowprotocol/assets/fonts/StudioFeixenSerif-Bold.woff2'
import FONT_STUDIO_FEIXEN_SERIF_REGULAR from '@cowprotocol/assets/fonts/StudioFeixenSerif-Regular.woff2'
import { baseGlobalStyles, Color, Font, Media, ThemeColorVars, UI } from '@cowprotocol/ui'

import { createGlobalStyle } from 'styled-components/macro'

const GlobalStyles = createGlobalStyle`
${ThemeColorVars}

  :root {
    ${UI.FONT_FAMILY_PRIMARY}: ${Font.familyStudioFeixen};
    ${UI.FONT_FAMILY_MONO}: ${Font.familyStudioFeixenMono};
  }

${baseGlobalStyles}

  @font-face {
    font-family: 'studiofeixen';
    src: url(${FONT_STUDIO_FEIXEN_REGULAR}) format('woff2');
    font-weight: ${Font.weight.regular};
    font-style: normal;
    font-display: fallback;
  }

  @font-face {
    font-family: 'studiofeixen';
    src: url(${FONT_STUDIO_FEIXEN_MEDIUM}) format('woff2');
    font-weight: ${Font.weight.medium};
    font-style: normal;
    font-display: fallback;
  }

  @font-face {
    font-family: 'studiofeixen';
    src: url(${FONT_STUDIO_FEIXEN_SEMIBOLD}) format('woff2');
    font-weight: ${Font.weight.semibold};
    font-style: normal;
    font-display: fallback;
  }

  @font-face {
    font-family: 'studiofeixen';
    src: url(${FONT_STUDIO_FEIXEN_BOLD}) format('woff2');
    font-weight: ${Font.weight.bold};
    font-style: normal;
    font-display: fallback;
  }

  @font-face {
    font-family: 'studiofeixenserif';
    src: url(${FONT_STUDIO_FEIXEN_SERIF_BOLD}) format('woff2');
    font-weight: ${Font.weight.bold};
    font-style: normal;
    font-display: fallback;
  }

  @font-face {
    font-family: 'studiofeixenserif';
    src: url(${FONT_STUDIO_FEIXEN_SERIF_REGULAR}) format('woff2');
    font-weight: ${Font.weight.regular};
    font-style: normal;
    font-display: fallback;
  }

  html, body {
    width: 100%;
    min-height: 100vh;
    min-width: 300px;
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

  body {
    font-family: ${Font.familyStudioFeixen};
    background: ${UI.COLOR_NEUTRAL_98};
    color: ${UI.COLOR_TEXT};
    font-variant: none;
    font-variant-ligatures: none;
    text-rendering: optimizeLegibility;
    font-feature-settings:
      'liga' off,
      'kern' on;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }

  *::selection {
    background: var(${UI.COLOR_NEUTRAL_100});
    color: var(${UI.COLOR_NEUTRAL_0});
  }

  *::-moz-selection {
    background: var(${UI.COLOR_NEUTRAL_100});
  }

  *::-webkit-selection {
    background: var(${UI.COLOR_NEUTRAL_100});
  }

  *::-moz-placeholder {
    line-height: revert;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  a {
    color: inherit;
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
      border-color: var(${UI.COLOR_NEUTRAL_0});
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
