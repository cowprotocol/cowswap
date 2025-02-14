import { css } from 'styled-components/macro'

const variables = css`
  /* General styles */
  :root {
    /* FONTS */
    --font-default: 'Inter', 'Helvetica Neue', Helvetica, sans-serif;
    --font-mono: 'Roboto Mono', monospace;
    --font-arial: Arial, Helvetica, sans-serif;
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-bold: 700;

    /* BORDERS */
    --border-radius: 0.4375rem;
    --border-radius-top: 0.6rem 0.6rem 0 0;

    /* BOX-SHADOW */
    --box-shadow-wrapper: 0 -1rem 4rem 0 rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02) 0 0.276726rem 0.221381rem 0,
      rgba(0, 0, 0, 0.027) 0 0.666501rem 0.532008rem 0, rgba(0, 0, 0, 0.035) 0 1.25216rem 1.0172rem 0,
      rgba(0, 0, 0, 0.043) 0 2.23363rem 1.7869rem 0, rgba(0, 0, 0, 0.05) 0 4.17776rem 3.34221rem 0,
      rgba(0, 0, 0, 0.07) 0 10rem 8rem 0;

    /* GRID */
    --grid-row-size-walletPage: minmax(10.9375rem, 1.1fr) repeat(3, 1fr) minmax(10.3125rem, 1fr);
  }
`

export default variables
