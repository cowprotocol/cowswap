import styled from 'styled-components/macro'

import { NumericalInput } from 'modules/trade/pure/TradeNumberInput/styled'
import { TradeWidgetFieldBox } from 'modules/trade/pure/TradeWidgetField/styled'

export const InputsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: max-content;
  width: 100%;
  gap: 10px;

  > ${TradeWidgetFieldBox} {
    flex-flow: row nowrap;
  }

  > ${TradeWidgetFieldBox} ${NumericalInput} {
    width: 100%;
  }
`
