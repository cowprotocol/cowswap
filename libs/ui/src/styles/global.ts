import { css } from 'styled-components/macro'

export const baseGlobalStyles = css`
  html,
  body {
    margin: 0;
    padding: 0;
    scroll-behavior: smooth;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Lock <html> too so Base UI sees the page as already locked and skips scrollbar-gutter. */
  html:has(body.noScroll) {
    overflow: hidden;
  }
`
