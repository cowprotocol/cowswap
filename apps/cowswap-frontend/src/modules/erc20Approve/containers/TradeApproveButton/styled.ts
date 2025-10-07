import { ButtonSize, Loader } from '@cowprotocol/ui'

import { AlertCircle } from 'react-feather'
import styled, { css } from 'styled-components/macro'

const TRADE_BUTTON_SIZES_STYLE = {
  [ButtonSize.BIG]: css`
    font-size: 18px;
    min-height: 58px;
  `,
  [ButtonSize.DEFAULT]: css`
    font-size: 16px;
    max-height: 48px;
  `,
  [ButtonSize.SMALL]: css`
    font-size: 12px;
  `,
}

export const ButtonLabelWrapper = styled.div<{ buttonSize: ButtonSize }>`
  display: flex;
  align-items: center;
  gap: 8px;
  ${({ buttonSize = ButtonSize.DEFAULT }) => TRADE_BUTTON_SIZES_STYLE[buttonSize]};
`

export const StyledLoader = styled(Loader)`
  stroke: ${({ theme }) => theme.text1};
`

export const StyledAlert = styled(AlertCircle)`
  display: flex;
  align-items: center;
  color: inherit;
  margin-top: 0;
`
