import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const CompactBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 12px 16px;
  border-radius: 16px;
  background: var(${UI.COLOR_SUCCESS_BG});
  color: var(${UI.COLOR_SUCCESS_TEXT});
`

export const CompactText = styled.span`
  ${font('FONT_NORMAL', 'regular')}
  line-height: 1;
  color: var(${UI.COLOR_SUCCESS_TEXT});
  text-align: center;
`

export const CompactAmount = styled.strong`
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
`
