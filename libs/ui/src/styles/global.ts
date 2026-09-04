import { css } from 'styled-components/macro'

import { UI } from '../enum'

export const baseGlobalStyles = css`
  *,
  *:after,
  *:before {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  // This locks <html> too so Base UI sees the page as already locked and skips scrollbar-gutter.
  // It also prevents the page content from moving right when the scrollbar is hidden.
  html:has(body.noScroll) {
    overflow: hidden;
  }

  button,
  textarea,
  select,
  // Using where to avoid specificity issues with the input type selectors:
  input:where(:not([type='checkbox'], [type='radio'], [type='range'])) {
    border: none;
    padding: 0;
    margin: 0;
    background: none;
    outline: none;
    font: inherit;
    color: inherit;
    appearance: none;
  }

  button {
    user-select: none;
    cursor: pointer;

    &:disabled {
      cursor: not-allowed;
    }

    // Default outline only for buttons because inputs/textareas match :focus-visible on mouse click, so they keep outline: none.
    &:focus-visible {
      outline: 1.5px dotted var(${UI.COLOR_TEXT});
      outline-offset: 2px;
    }
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  p {
    margin: 0;
  }

  a {
    color: inherit;
  }
`
