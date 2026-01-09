import { UI, InlineBanner } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const StatusMessage = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0 0 10px;
`

export const SpinnerRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 9px;
  background: var(${UI.COLOR_NEUTRAL_98});
  color: var(${UI.COLOR_TEXT});
`

export const Footer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 10px 10px;
`

export const HelperText = styled.div`
  text-align: center;
  font-size: var(${UI.FONT_SIZE_SMALL});
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 6px 0 10px;
`

export const InlineAlert = styled(InlineBanner)`
  border-radius: 9px;
  padding: 12px 16px;
`

export const ErrorInline = styled(InlineBanner)`
  border-radius: 9px;
  padding: 12px 16px;
`
