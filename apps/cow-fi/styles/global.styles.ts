import styled, { createGlobalStyle } from 'styled-components'
import { Color, Media, Font } from '@cowprotocol/ui'
import { transparentize } from 'polished'

const GlobalStyles = createGlobalStyle`

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
          font-display: fallback;
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
    padding: 0;
    border-radius: 28px;
    display: inline-block;
    padding: 3px 16px;
  }

  .wordtag-blue {
    color: #012f7a;
    background: #65d9ff;
  }

  .wordtag-orange {
    color: #ec4612;
    background: #fee7cf;
  }

  .wordtag-purple {
    color: #f996ee;
    background: #490072;
  }
`

export const ExternalLink = styled.a`
  display: inline-block;
  color: ${Color.neutral0};
  font-size: inherit;
  white-space: nowrap;

  &::after {
    content: '↗';
    color: inherit;
    font-size: 16px;
    display: inline-block;
    margin: 0 0 0 0.2rem;
  }
`

export const DropDown = styled.div`
  border: 0.1rem solid ${transparentize(0.9, Color.neutral100)};
  border-radius: 0.6rem;
  width: 100%;
  padding: 0;
  background: ${Color.neutral0};
  color: ${Color.neutral100};
  font-size: 1.8rem;
  margin: 0 0 2.4rem;
  display: flex;
  flex-flow: row nowrap;
  position: relative;

  &::after {
    content: '▼';
    position: absolute;
    border: 0;
    color: inherit;
    font-size: 16px;
    display: flex;
    align-items: center;
    pointer-events: none;
    margin: auto;
    height: 100%;
    top: 0;
    bottom: 0;
    right: 1.2rem;
    cursor: pointer;
  }

  > select {
    appearance: none;
    cursor: pointer;
    height: 100%;
    padding: 1.2rem;
    width: 100%;
    display: block;
    color: inherit;
    font-family: inherit;
    font-size: inherit;
    border: 0;
    border-radius: inherit;
    background: ${transparentize(0.9, Color.neutral0)};

    &:focus {
      outline: none;
    }

    > option {
      background-color: ${Color.neutral0};
      color: ${Color.neutral0};
    }
  }
`

export default GlobalStyles
