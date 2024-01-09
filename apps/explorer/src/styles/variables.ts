import { css } from 'styled-components'

const AllColors = `
  /* FONTS */
  --font-default: "Inter", "Helvetica Neue", Helvetica, sans-serif;
  --font-mono: "Roboto Mono", monospace;
  --font-arial: Arial, Helvetica, sans-serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;
  /* ------------------------------ */
`

const LightColors = `
  /* Background */
  --color-background-lighter: #f7f7f7;
  --color-background-darker: #EDF2F7;
  --color-background: #EDF2F7;
  --color-background-pageWrapper: #fff;
  --color-background-actionCards: #bbfdbb;
  --color-background-highlighted: #fcfde0;
  --color-background-selected: #d9d9d9;
  --color-background-selected-darker: #b6b6b6;
  --color-background-selected-dark: #bfbfbf;
  --color-background-progressBar: lightskyblue;
  --color-background-input: #e7ecf3;
  --color-background-input-lighter: #ffffff;
  --color-background-validation-warning: #fff0eb;
  --color-background-row-hover: #deeeff;
  --color-background-CTA: #218DFF;
  --color-background-selection: #218DFF;
  --color-background-button-hover: #0B66C6;
  --color-background-button-disabled-hover: #2772c3;
  --color-background-balance-button-hover: #218DFF;

  /* Borders */
  --color-border: transparent;

  /* Text */
  --color-text-primary: #456483;
  --color-text-secondary: #9FB4C9;
  --color-text-active: #218DFF;
  --color-text-alternate: #456483;
  --color-text-CTA: #fff;
  --color-text-selection: #fff;
  --color-text-button-hover: #fff;

  /* Buttons */
  --color-button-primary: #000;
  --color-button-success: #5ca95c;
  --color-button-disabled: #666;
  --color-button-danger: #e55353;
  --color-button-secondary: #696969;
  --color-button-warning: #f1851d;
  --color-modali-close: #526877;

  /* Components */
  --color-background-banner: #DFE6EF;
  --color-text-wallet: #000;
  --color-text-deposit-header: #000000;
  --color-background-nav-active: #DFE6EF;
  --color-background-opaque-grey: #2f3e4e80;
  --color-text-modali: #526877;

  /* SVGs */
  --color-svg-deposit: #000;
  --color-svg-withdraw: #fff;
  --color-svg-switcher: #476481;

  /* Shadow */
  --shadow-color: #00000047;

  /* States */
  --color-error: red;
  --color-text-deleteOrders: #a71409;
  --color-background-deleteOrders: #ffd6d6;
`

const DarkColors = `
  /* Background */
  --color-background-lighter: #f7f7f7;
  --color-background: #2e2e2e;
  --color-background-pageWrapper: #181a1b;
  --color-background-actionCards: #0269025c;
  --color-background-highlighted: #3f4104;
  --color-background-selected: #d9d9d9;
  --color-background-selected-darker: #b6b6b6;
  --color-background-selected-dark: #2a2d2f;
  --color-background-progressBar: #4338b5;
  --color-background-input: #2a2d2f;
  --color-background-input-lighter: #404040;
  --color-background-validation-warning: #4338b5;
  --color-background-row-hover: #09233e;
  --color-background-CTA: #2e2e2e;
  --color-background-selection: #181a1b;
  --color-background-button-hover: #0B66C6;
  --color-background-button-disabled-hover: #2772c3;
  --color-background-balance-button-hover: #0B66C6;

  /* Borders */
  --color-border: #262626;

  /* Text */
  --color-text-primary: #a1c3e4;
  --color-text-secondary: #545454;
  --color-text-active: #218DFF;
  --color-text-CTA: #218DFF;
  --color-text-selection: #218DFF;
  --color-text-button-hover: #e9e9f0;

  /* Buttons */
  --color-button-primary: #e8e6e3;
  --color-button-success: #00BE2E;
  --color-button-disabled: #3d4043;
  --color-button-danger: #eb4025;
  --color-button-secondary: #696969;
  --color-button-warning: #f1851d;
  --color-modali-close: #218DFF;

  /* Components */
  --color-background-banner: #252729;
  --color-text-banner: wheat;
  --color-background-nav-active: #404040;

  /* SVGs */
  --color-svg-deposit: #218DFF;
  --color-svg-withdraw: #000;
  --color-svg-switcher: #218DFF;

  /* Shadow */
  --shadow-color: #00000047;

  /* States */
  --color-error: #cd3636;
  --color-text-deleteOrders: #bdb6b5;
  --color-background-deleteOrders: #621b1b;
`

const variables = css`
  /* General styles for all themes */
  :root {
    ${AllColors}
  }

  :root,
  body.light-theme {
    /* COLOURS */

    ${LightColors}

    /* BORDERS */
    --border-radius: 0.4375rem;
    --border-radius-top: 0.6rem 0.6rem 0 0;

    /* BOX-SHADOW */
    --box-shadow: 0.0625rem 0.125rem 0.125rem -0.0625rem var(--shadow-color);
    --box-shadow-wrapper: 0 -1rem 4rem 0 rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.02) 0 0.276726rem 0.221381rem 0,
      rgba(0, 0, 0, 0.027) 0 0.666501rem 0.532008rem 0, rgba(0, 0, 0, 0.035) 0 1.25216rem 1.0172rem 0,
      rgba(0, 0, 0, 0.043) 0 2.23363rem 1.7869rem 0, rgba(0, 0, 0, 0.05) 0 4.17776rem 3.34221rem 0,
      rgba(0, 0, 0, 0.07) 0 10rem 8rem 0;

    /* GRID */
    --grid-row-size-walletPage: minmax(10.9375rem, 1.1fr) repeat(3, 1fr) minmax(10.3125rem, 1fr);
  }

  @media (prefers-color-scheme: dark) {
    :root {
      ${DarkColors}
    }
  }

  body.dark-theme {
    ${DarkColors}
  }
`

export default variables
