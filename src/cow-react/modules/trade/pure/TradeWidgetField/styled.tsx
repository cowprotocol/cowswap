import styled from 'styled-components/macro'
import { transparentize } from 'polished'

export const TradeWidgetFieldWrapper = styled.div`
  width: 100%;
  background: ${({ theme }) => theme.grey1};
  border-radius: 16px;
  padding: 10px 16px;
`

export const TradeWidgetFieldGrid = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  gap: 10px;
`

export const TradeWidgetFieldLabel = styled.span`
  display: inline-flex;
  align-items: center;
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => transparentize(0.3, theme.text1)};
`
