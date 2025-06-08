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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TradeTextBox(props: TradeWidgetFieldProps) {
  return <StyledTradeWidgetField {...props} />
}
