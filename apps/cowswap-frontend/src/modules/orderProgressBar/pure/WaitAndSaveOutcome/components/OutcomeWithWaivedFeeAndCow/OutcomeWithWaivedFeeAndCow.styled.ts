import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const SavingsBox = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 8px;
  width: 100%;
  border-top: 1px solid color-mix(in srgb, var(${UI.COLOR_SUCCESS_TEXT}) 18%, transparent);
`

export const SavingsRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`

export const SavingsLabel = styled.span`
  min-width: 0;
  ${font('FONT_NORMAL_PLUS', 'regular')}
  line-height: 1;
  color: var(${UI.COLOR_SUCCESS_TEXT});

  > * {
    vertical-align: middle;
    margin-left: 4px;
  }
`

export const SavingsValue = styled.span`
  ${font('FONT_NORMAL_PLUS', 'regular')}
  line-height: 1;
  flex-shrink: 0;
  color: color-mix(in srgb, var(${UI.COLOR_SUCCESS_TEXT}) 55%, transparent);
`

export const SavingsAmount = styled.strong`
  font-weight: var(${UI.FONT_WEIGHT_SEMIBOLD});
  color: var(${UI.COLOR_SUCCESS_TEXT});
`
