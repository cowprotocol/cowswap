import { css } from 'styled-components'

const AllColors = `
  /* HEIGHTS */
  --height-bar-default: 4.8rem;
  --height-bar-small: 4rem;
  --height-button-default: 3rem;
  /* ------------------------------ */

  /* MISC */
  --border-radius-default: .3rem;
  --padding-container-default: 1.2rem;

  /* FONTS */
  --font-default: "Inter", "Helvetica Neue", Helvetica, sans-serif;
  --font-arial: Arial, Helvetica, sans-serif;
  --font-avenir: Avenir, Helvetica, sans-serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  --font-size-small: 1.1rem;
  --font-size-default: 1.2rem;
  --font-size-large: 1.3rem;
  --font-size-larger: 1.4rem;
  --font-size-xlarger: 1.5rem;
  /* ------------------------------ */
`

const DarkColors = `
  /* Palette specific */
  --color-green: #00C46E;
  --color-red: #FF305B;

  // --color-primary: #1E1F2B;
  --color-primary: #181923;
  --color-menu-mobile: #0e0f14; /* bg4 */
  --color-transparent: transparent;
  --color-long: var(--color-green);
  --color-short: var(--color-red);

  /* Gradients */
  --color-gradient-1: #21222E;
  --color-gradient-2: #2C2D3F;

  /* Borders */
  --color-border: #2e3148;

  /* Text */
  --color-text-primary: #ffffff;
  --color-text-secondary1: #EDEDED;
  --color-text-secondary2: #9797B8;
  --color-text-hover: rgb(137 88 253 / 20%);
  --color-text-strong: #ffffff;
  --color-text-weak: rgba(214,214,214,1.00);


  /* Buttons */
  --color-button-gradient: linear-gradient(270deg, #8958FF 0%, #3F77FF 100%);
  --color-button-gradient-2: linear-gradient(270deg, #8958FF 30%, #3F77FF 100%);
`

const variables = css`
  /* General styles for all themes */
  :root {
    ${AllColors}
    ${DarkColors}
  }

  body {
    overscroll-behavior-y: none;
  }
`

export default variables
