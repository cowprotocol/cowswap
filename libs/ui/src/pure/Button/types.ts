import { css } from 'styled-components/macro'

export enum ButtonSize {
  SMALL,
  DEFAULT,
  BIG,
}

export const BUTTON_SIZES_STYLE = {
  [ButtonSize.BIG]: css`
    font-size: 26px;
    min-height: 60px;
  `,
  [ButtonSize.DEFAULT]: css`
    font-size: 16px;
  `,
  [ButtonSize.SMALL]: css`
    font-size: 12px;
  `,
}
