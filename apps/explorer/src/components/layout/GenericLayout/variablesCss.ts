import { Color } from '@cowprotocol/ui'

import { css } from 'styled-components/macro'

const AllColors = css`
  /* HEIGHTS */
  --height-bar-default: 4.8rem;
  --height-bar-small: 4rem;
  --height-button-default: 3rem;
  /* ------------------------------ */

  /* MISC */
  --border-radius-default: 0.3rem;
  --padding-container-default: 1.2rem;

  /* FONTS */
  --font-default: 'Inter', 'Helvetica Neue', Helvetica, sans-serif;
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

const DarkColors = css`
  /* Palette specific */
  --color-green: ${Color.explorer_green1};
  --color-red: ${Color.explorer_red1};

  --color-primary: ${Color.explorer_bg};
  --color-menu-mobile: ${Color.explorer_bg2};
  --color-transparent: transparent;
  --color-long: ${Color.explorer_green1};
  --color-short: ${Color.explorer_red1};

  /* Gradients */
  --color-gradient-1: ${Color.explorer_gradient1};
  --color-gradient-2: ${Color.explorer_gradient2};

  /* Borders */
  --color-border: ${Color.explorer_border};

  /* Text */
  --color-text-primary: ${Color.explorer_textPrimary};
  --color-text-secondary1: ${Color.explorer_textSecondary1};
  --color-text-secondary2: ${Color.explorer_textSecondary2};
  --color-text-hover: ${Color.explorer_textActive};
  --color-text-strong: ${Color.explorer_textPrimary};
  --color-text-weak: ${Color.explorer_textSecondary};

  /* Buttons */
  --color-button-gradient: linear-gradient(270deg, #8958ff 0%, #3f77ff 100%);
  --color-button-gradient-2: linear-gradient(270deg, #8958ff 30%, #3f77ff 100%);
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
