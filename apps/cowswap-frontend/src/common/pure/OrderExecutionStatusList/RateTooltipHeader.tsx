import styled from 'styled-components/macro'

import { UI } from 'common/constants/theme'

import { OrderExecutionStatusList } from './index'

const Content = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 5px 10px;

  > p {
    font-size: 13px;
    font-weight: 400;
    line-height: 1.5;
    padding: 0;
    margin: 0;
    color: var(${UI.COLOR_TEXT1});
  }

  > h3 {
    font-size: 14px;
    font-weight: 600;
    margin: 21px 0 0;
    padding: 0;
    text-align: left;
    width: 100%;
  }
`

interface RateTooltipHeaderProps {
  isOpenOrdersTab?: boolean
}

export function RateTooltipHeader({ isOpenOrdersTab }: RateTooltipHeaderProps) {
  return (
    <Content>
      <p>Fees (incl. gas) are covered by filling your order when the market price is better than your limit price.</p>

      {isOpenOrdersTab && (
        <>
          <h3>How close is my order to executing?</h3>
          <OrderExecutionStatusList />
        </>
      )}
    </Content>
  )
}
