import { TradeWidgetField, TradeWidgetFieldProps } from '../TradeWidgetField'
import styled from 'styled-components/macro'

const StyledTradeWidgetField = styled(TradeWidgetField)`
  background-color: ${({ theme }) => theme.bg1};
  border: 1px solid ${({ theme }) => theme.grey1};
`

export function TradeTextBox(props: TradeWidgetFieldProps) {
  return <StyledTradeWidgetField {...props} />
}
