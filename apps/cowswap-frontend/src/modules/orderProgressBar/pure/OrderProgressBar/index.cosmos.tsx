import { USDC_BASE, USDC_GNOSIS_CHAIN } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { UI } from '@cowprotocol/ui'
import { CurrencyAmount, Percent } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { Order } from 'legacy/state/orders/actions'

import { SwapAndBridgeContext, SwapAndBridgeStatus } from 'modules/bridge'

import { getOrderMock } from '../../../../mocks/orderMock'
import { inputCurrencyInfoMock } from '../../../../mocks/tradeStateMock'
import { OrderProgressBarProps } from '../../types'

import { OrderProgressBar } from './index'

const order = {
  ...getOrderMock(SupportedChainId.MAINNET),
  apiAdditionalInfo: { executedBuyAmount: '1000000000000000000000', executedSellAmount: '5000000000000000000' },
} as Order

const receiveAmountInfo = inputCurrencyInfoMock.receiveAmountInfo!

const swapAndBridgeContextMock: SwapAndBridgeContext = {
  bridgeProvider: {
    logoUrl:
      'https://raw.githubusercontent.com/cowprotocol/cow-sdk/refs/heads/main/src/bridging/providers/across/across-logo.png',
    name: 'Across',
  },
  quoteSwapContext: {
    chainName: 'Gnosis',
    receiveAmountInfo,
    sellAmount: receiveAmountInfo.beforeNetworkCosts.sellAmount,
    buyAmount: receiveAmountInfo.afterNetworkCosts.buyAmount,
    slippage: new Percent(2000, 100),
    recipient: '0xd0b931c58ff095f028C2b37fd95740a2D4aB7257',
    minReceiveAmount: receiveAmountInfo.afterSlippage.sellAmount,
    minReceiveUsdValue: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '29000001'),
    expectedReceiveUsdValue: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '29560000'),
  },
  quoteBridgeContext: {
    chainName: 'Gnosis',
    estimatedTime: 8,
    recipient: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
    bridgeFee: CurrencyAmount.fromRawAmount(USDC_BASE, '150000'),
    sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
    buyAmount: CurrencyAmount.fromRawAmount(USDC_BASE, '28700000'),
    buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '28700004'),
  },
  bridgingProgressContext: {
    account: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
  },
  swapResultContext: {
    winningSolver: {
      solver: 'The Best Solver',
    },
    receivedAmount: receiveAmountInfo.afterNetworkCosts.buyAmount,
    receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '29800000'),
    surplusAmount: CurrencyAmount.fromRawAmount(
      receiveAmountInfo.afterNetworkCosts.buyAmount.currency,
      '120000000000000000',
    ),
    surplusAmountUsd: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '1300'),
  },
  bridgingStatus: SwapAndBridgeStatus.PENDING,
}

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
  swapAndBridgeContext: swapAndBridgeContextMock,
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
  bridgingInProgress: () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName="bridgingInProgress" />
    </Wrapper>
  ),
  bridgingFailed: () => (
    <Wrapper>
      <OrderProgressBar
        {...defaultProps}
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock,
          bridgingStatus: SwapAndBridgeStatus.FAILED,
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext,
            isFailed: true,
          },
        }}
        stepName="bridgingFailed"
      />
    </Wrapper>
  ),
  refundCompleted: () => (
    <Wrapper>
      <OrderProgressBar
        {...defaultProps}
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.REFUND_COMPLETE,
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext,
            isRefunded: true,
          },
        }}
        stepName="refundCompleted"
      />
    </Wrapper>
  ),
  bridgingFinished: () => (
    <Wrapper>
      <OrderProgressBar
        {...defaultProps}
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext,
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_BASE, '29100000'),
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '29800000'),
          },
        }}
        stepName="bridgingFinished"
      />
    </Wrapper>
  ),
}

export default Fixtures
