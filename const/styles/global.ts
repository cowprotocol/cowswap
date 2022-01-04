import styled, { createGlobalStyle } from 'styled-components'
import { Color, Font, Media } from 'const/styles/variables'

const GlobalStyles = createGlobalStyle`
  html, body {  
    width: 100%;
    min-height: 100vh;
    min-width: 300px;
    margin: 0;
    font-size: 62.5%;
    line-height: 10px;
    font-family: ${Font.default};
    background-color: ${Color.black};
    color: ${Color.white};
    box-sizing: border-box;
    scroll-behavior: smooth;
    font-variant: none;
    text-rendering: geometricPrecision;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
    scrollbar-color: ${Color.orange} ${Color.black};

    html,
    input,
    textarea,
    button {
      font-family: 'Inter', sans-serif;
      font-display: fallback;
  }

  @supports (font-variation-settings: normal) {
    html,
    input,
    textarea,
    button {
      font-family: 'Inter var', sans-serif;
    }
  }

    &::-webkit-scrollbar {
      width: 1.6rem;
    }

    &::-webkit-scrollbar-track {
      background-color: ${Color.black};
    }

    &::-webkit-scrollbar-thumb {
      background-color: ${Color.orange};
      border-radius: 10rem;
    }
  }

  *::selection {
    background: ${Color.orange};
    color: ${Color.black};
  }

  *::-moz-selection {
    background: ${Color.orange};
  }

  *::-webkit-selection {
    background: ${Color.orange};
  }

  *::-moz-placeholder {
    line-height: revert;
  }

  ::-webkit-scrollbar {
    width: 6px !important;
    height: 6px !important;
  }

  ::-webkit-scrollbar-thumb {
      background-color: rgba(0,0,0,.2);
  }

  ::-webkit-scrollbar-track {
      background: hsla(0,0%,100%,.1);
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }

  a {   
    text-decoration: underline;
    cursor: pointer;
    
      &:link, 
      &:visited {
        color: ${Color.orange};
      }
  }

  h1, h2, h3, p, b, i, strong {
    margin: 0;
    line-height: 1;
  }

  ul, ol {
    font-size: ${Font.sizeDefault};
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
      border-color: ${Color.orange};
    }

    &:disabled {
      opacity: 0.8;
    }
  }
  
  .noScroll {
    overflow: hidden;
  }

  .mobileOnly {
    display: none !important;
    
    ${Media.mobile} {
      display: block !important;
    }
  }
`

export const ExternalLink = styled.a`
  display: inline-block;
  color: ${Color.orange};

  &::after {
    content: "↗";
    color: inherit;
    font-size: ${Font.sizeDefault};
    display: inline-block;
  }
`

export default GlobalStyles
