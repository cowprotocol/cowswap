import { USDC_GNOSIS_CHAIN } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { getOrderMock } from 'mocks/orderMock'
import styled from 'styled-components/macro'

import { Order } from 'legacy/state/orders/actions'

import { OrderProgressBarV2, OrderProgressBarV2Props } from './index'

const order = {
  ...getOrderMock(SupportedChainId.MAINNET),
  apiAdditionalInfo: { executedBuyAmount: '1000000000000000000000', executedSellAmount: '5000000000000000000' },
} as Order

const defaultProps: OrderProgressBarV2Props = {
  order,
  stepName: 'initial',
  showCancellationModal: () => {
    alert('cancellation triggered o/')
  },
  solverCompetition: [
    {
      solver: 'naive',
      executedAmounts: {
        sell: '5000000000000000000',
        buy: '1000000000000000000000',
      },
    },
    { solver: 'uniswap', executedAmounts: { sell: '5000000000000000000', buy: '500000000000000000000' } },
    { solver: 'oneinch', executedAmounts: { sell: '5000000000000000000', buy: '400000000000000000000' } },
  ],
  surplusData: {
    surplusFiatValue: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '10000000'),
    surplusAmount: CurrencyAmount.fromRawAmount(order.outputToken, '1000000000000000000'),
    surplusToken: order.outputToken,
    surplusPercent: '10',
    showFiatValue: true,
    showSurplus: true,
  },
}

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
`

const Fixtures = {
  '1-initial': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} />
    </Wrapper>
  ),
  '2-solving': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="solving" countdown={15} />
    </Wrapper>
  ),
  '2a-delayed': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="delayed" />
    </Wrapper>
  ),
  '2b-unfillable': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="unfillable" />
    </Wrapper>
  ),
  '2c-solved': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="solved" />
    </Wrapper>
  ),
  '2d-nextBatch': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="nextBatch" />
    </Wrapper>
  ),
  '3-executing': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="executing" />
    </Wrapper>
  ),
  '3a-submissionFailed': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="submissionFailed" />
    </Wrapper>
  ),
  '4-finished': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="finished" />
    </Wrapper>
  ),
  '4a-cancellationFailed': (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="cancellationFailed" />
    </Wrapper>
  ),
  cancelling: (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="cancelling" />
    </Wrapper>
  ),
  cancelled: (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="cancelled" />
    </Wrapper>
  ),
  expired: (
    <Wrapper>
      <OrderProgressBarV2 {...defaultProps} stepName="expired" />
    </Wrapper>
  ),
}

export default Fixtures
