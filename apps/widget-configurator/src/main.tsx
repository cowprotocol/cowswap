import { StrictMode } from 'react'
import { createGlobalStyle } from 'styled-components';

import * as ReactDOM from 'react-dom/client'

import App from './app/app'

const GlobalStyle = createGlobalStyle`
  html, input, textarea, button {
    font-family: 'Inter', sans-serif;
    font-display: fallback;
  }

  @supports (font-variation-settings: normal) {
    html, input, textarea, button {
      font-family: 'Inter var', sans-serif;
    }
  }

  html, body, a, button {
    margin: 0;
    padding: 0;
  }

  html, body, #root {
    height: 100%;
    width: 100%;
  }

  a {
    color: blue;
  }

  button {
    user-select: none;
  }

  html {  
    width: 100%;
    margin: 0;
    font-size: 62.5%;
    text-rendering: geometricPrecision;
    line-height: 10px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    box-sizing: border-box;
    overscroll-behavior-y: none;
    scroll-behavior: smooth;
    font-variant: none;
    font-feature-settings: 'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    background: linear-gradient(45deg,#EAE9FF 14.64%,#CAE9FF 85.36%);
    background-attachment: fixed;
  }

  *, *:before, *:after {
    box-sizing: inherit;
  }
`;


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <GlobalStyle />
    <App />
  </StrictMode>
)
