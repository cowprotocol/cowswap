import { font, NewTooltip, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const AmountTooltip = styled(NewTooltip)`
  display: inline-flex;
  max-width: 100%;
`

export const SavingsBox = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 12px;
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
  color: var(${UI.COLOR_SUCCESS_TEXT});

  .noBreak > * {
    vertical-align: middle;
  }
`

export const SavingsValue = styled.span`
  ${font('FONT_NORMAL_PLUS', 'regular')}
  flex-shrink: 0;
  color: color-mix(in srgb, var(${UI.COLOR_SUCCESS_TEXT}) 55%, transparent);
`

export const SavingsAmount = styled.strong`
  font-weight: var(${UI.FONT_WEIGHT_SEMIBOLD});
  color: var(${UI.COLOR_SUCCESS_TEXT});
`
