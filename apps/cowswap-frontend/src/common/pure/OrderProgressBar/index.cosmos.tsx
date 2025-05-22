import { USDC_GNOSIS_CHAIN } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UI } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { getOrderMock } from 'mocks/orderMock'
import styled from 'styled-components/macro'

import { Order } from 'legacy/state/orders/actions'

import { OrderProgressBarProps } from './types'

import { OrderProgressBar } from './index'

const order = {
  ...getOrderMock(SupportedChainId.MAINNET),
  apiAdditionalInfo: { executedBuyAmount: '1000000000000000000000', executedSellAmount: '5000000000000000000' },
} as Order

const defaultProps: OrderProgressBarProps = {
  order,
  chainId: 1,
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
  totalSolvers: 52,
  surplusData: {
    surplusFiatValue: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '10000000'),
    surplusAmount: CurrencyAmount.fromRawAmount(order.outputToken, '1000000000000000000'),
    surplusToken: order.outputToken,
    surplusPercent: '10',
    showFiatValue: true,
    showSurplus: true,
  },
  isProgressBarSetup: true,
}

const Wrapper = styled.div`
  width: 560px;
  margin: 0 auto;
  background: var(${UI.COLOR_PAPER});
`

const Fixtures = {
  '1-initial': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} />
    </Wrapper>
  ),
  '2-solving': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="solving" countdown={15} />
    </Wrapper>
  ),
  '2a-delayed': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="delayed" />
    </Wrapper>
  ),
  '2b-unfillable': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="unfillable" />
    </Wrapper>
  ),
  '2c-solved': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="solved" />
    </Wrapper>
  ),
  '3-executing': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="executing" />
    </Wrapper>
  ),
  '3a-submissionFailed': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="submissionFailed" />
    </Wrapper>
  ),
  '4-finished': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="finished" />
    </Wrapper>
  ),
  '4-finished-customReceiver': () => (
    <Wrapper>
      <OrderProgressBar
        {...defaultProps}
        order={{ ...order, receiver: '0xdd9EB88C5C6D2A85A08a96c7F0ccccE27Cb843cb' }}
        stepName="finished"
      />
    </Wrapper>
  ),
  '4-finished-customReceiver-ensName': () => (
    <Wrapper>
      <OrderProgressBar
        {...defaultProps}
        order={{ ...order, receiver: '0xdd9EB88C5C6D2A85A08a96c7F0ccccE27Cb843cb' }}
        receiverEnsName={'ihaveaname.eth'}
        stepName="finished"
      />
    </Wrapper>
  ),
  '4a-cancellationFailed': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="cancellationFailed" />
    </Wrapper>
  ),
  cancelling: () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="cancelling" />
    </Wrapper>
  ),
  cancelled: () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="cancelled" />
    </Wrapper>
  ),
  expired: () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="expired" />
    </Wrapper>
  ),
}

export default Fixtures
