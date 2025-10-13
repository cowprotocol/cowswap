import { ButtonConfirmed, ButtonSize, Loader } from '@cowprotocol/ui'

import { AlertCircle } from 'react-feather'
import styled from 'styled-components/macro'

export const ButtonWrapper = styled(ButtonConfirmed)<{ buttonSize: ButtonSize }>`
  width: 100%;
  padding: ${({ buttonSize }) => (buttonSize === ButtonSize.SMALL ? '10px' : '16px')};
  min-height: ${({ buttonSize }) => (buttonSize === ButtonSize.SMALL ? 'auto !important' : '58px')};
`

export const ButtonLabelWrapper = styled.div<{ buttonSize: ButtonSize }>`
  display: flex;
  align-items: center;
  gap: 8px;
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
