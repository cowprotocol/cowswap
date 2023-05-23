import styled from 'styled-components/macro'
import { TradeWidgetFieldBox, TradeWidgetFieldLabel } from 'modules/trade/pure/TradeWidgetField/styled'

export const Wrapper = styled(TradeWidgetFieldBox)`
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.grey1};
  flex-shrink: 1;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 1rem;
  `}
`

export const Label = styled(TradeWidgetFieldLabel)`
  font-size: 12px;
`

export const Value = styled(TradeWidgetFieldLabel)`
  font-size: 14px;
`
