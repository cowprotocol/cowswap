import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { TradeWidgetField, TradeWidgetFieldProps } from '../TradeWidgetField'

const StyledTradeWidgetField = styled(TradeWidgetField)`
  background-color: var(${UI.COLOR_PAPER});
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  display: flex;
  flex-flow: column wrap;
  align-items: flex-start;
`

export function TradeTextBox(props: TradeWidgetFieldProps) {
  return <StyledTradeWidgetField {...props} />
}
