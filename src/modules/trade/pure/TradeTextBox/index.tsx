import styled from 'styled-components/macro'

import { TradeWidgetField, TradeWidgetFieldProps } from '../TradeWidgetField'

const StyledTradeWidgetField = styled(TradeWidgetField)`
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.grey1};
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
`

export function TradeTextBox(props: TradeWidgetFieldProps) {
  return <StyledTradeWidgetField {...props} />
}
