import { useEffect, useState, ReactNode, useRef } from 'react'

import { USDC_BASE, USDC_GNOSIS_CHAIN } from '@cowprotocol/common-const'
import { SupportedChainId, BridgeStatus } from '@cowprotocol/cow-sdk'
import { UI } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { Order } from 'legacy/state/orders/actions'

import { SwapAndBridgeContext, SwapAndBridgeStatus } from 'modules/bridge'

import { getOrderMock } from '../../../../mocks/orderMock'
import { inputCurrencyInfoMock } from '../../../../mocks/tradeStateMock'
import { OrderProgressBarStepName } from '../../constants'
import { OrderProgressBarProps } from '../../types'

import { OrderProgressBar } from './index'

const order = {
  ...getOrderMock(SupportedChainId.MAINNET),
  apiAdditionalInfo: { executedBuyAmount: '1000000000000000000000', executedSellAmount: '5000000000000000000' },
} as Order

const receiveAmountInfo = inputCurrencyInfoMock.receiveAmountInfo!

const account = '0xfb3c7eb936cAA12B5A884d612393969A557d4307'
const swapAndBridgeContextMock: SwapAndBridgeContext = {
  bridgeProvider: {
    logoUrl:
      'https://raw.githubusercontent.com/cowprotocol/cow-sdk/refs/heads/main/src/bridging/providers/across/across-logo.png',
    name: 'Across',
    dappId: 'cow-sdk://bridging/providers/across',
    website: 'https://across.to',
  },
  overview: {
    sourceChainName: 'Ethereum',
    targetChainName: 'Ethereum',
    targetCurrency: USDC_BASE,
    sourceAmounts: {
      sellAmount: receiveAmountInfo.beforeNetworkCosts.sellAmount,
      buyAmount: receiveAmountInfo.afterNetworkCosts.buyAmount,
    },
    targetAmounts: {
      sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
      buyAmount: CurrencyAmount.fromRawAmount(USDC_BASE, '28700000'),
    },
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
    account,
    sourceChainId: 1,
    destinationChainId: USDC_BASE.chainId,
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
  stepName: OrderProgressBarStepName.INITIAL,
  isBridgingTrade: false,
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

function SolvingFixture(): ReactNode {
  const [countdown, setCountdown] = useState(15)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          // Clear interval when we're about to hit 0
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, []) // Empty dependency array - set up only once

  return (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName={OrderProgressBarStepName.SOLVING} countdown={countdown} />
    </Wrapper>
  )
}

const ALL_STEP_NAMES = Object.values(OrderProgressBarStepName)

function useStepTransitions(): {
  stepIndex: number
  direction: number
  currentStepName: OrderProgressBarProps['stepName']
} {
  const [stepIndex, setStepIndex] = useState(0)
  const [direction, setDirection] = useState(1)

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prevIndex) => {
        const nextIndex = prevIndex + direction
        
        if (nextIndex >= ALL_STEP_NAMES.length - 1) {
          setDirection(-1)
          return ALL_STEP_NAMES.length - 1
        }
        
        if (nextIndex <= 0) {
          setDirection(1)
          return 0
        }
        
        return nextIndex
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [direction])

  return {
    stepIndex,
    direction,
    currentStepName: ALL_STEP_NAMES[stepIndex],
  }
}

function useCountdownForSolving(currentStepName: OrderProgressBarProps['stepName']): number {
  const [countdown, setCountdown] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    if (currentStepName === OrderProgressBarStepName.SOLVING) {
      setCountdown(15)
      
      intervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (intervalRef.current) {
              clearInterval(intervalRef.current)
              intervalRef.current = null
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setCountdown(0)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentStepName])

  return countdown
}

function AnimatedProgressFixture(): ReactNode {
  const { stepIndex, direction, currentStepName } = useStepTransitions()
  const countdown = useCountdownForSolving(currentStepName)

  return (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(0,0,0,0.1)', borderRadius: '8px' }}>
        <strong>Current Step:</strong> {currentStepName} ({stepIndex + 1}/{ALL_STEP_NAMES.length})
        <br />
        <strong>Direction:</strong> {direction > 0 ? 'Forward' : 'Backward'}
      </div>
      <OrderProgressBar 
        {...defaultProps} 
        stepName={currentStepName} 
        countdown={countdown}
        key={`${currentStepName}-${stepIndex}`}
      />
    </Wrapper>
  )
}

const Fixtures = {
  '0-animated-all-steps': () => <AnimatedProgressFixture />,
  '1-initial': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} />
    </Wrapper>
  ),
  '2-solving': () => <SolvingFixture />,
  '2a-delayed': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName={OrderProgressBarStepName.DELAYED} />
    </Wrapper>
  ),
  '2b-unfillable': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName={OrderProgressBarStepName.UNFILLABLE} />
    </Wrapper>
  ),
  '2c-solved': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName={OrderProgressBarStepName.SOLVED} />
    </Wrapper>
  ),
  '3-executing': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName={OrderProgressBarStepName.EXECUTING} />
    </Wrapper>
  ),
  '3a-submissionFailed': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName={OrderProgressBarStepName.SUBMISSION_FAILED} />
    </Wrapper>
  ),
  '4-finished': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName={OrderProgressBarStepName.FINISHED} />
    </Wrapper>
  ),
  '4-finished-customReceiver': () => (
    <Wrapper>
      <OrderProgressBar
        {...defaultProps}
        order={{ ...order, receiver: '0xdd9EB88C5C6D2A85A08a96c7F0ccccE27Cb843cb' }}
        stepName={OrderProgressBarStepName.FINISHED}
      />
    </Wrapper>
  ),
  '4-finished-customReceiver-ensName': () => (
    <Wrapper>
      <OrderProgressBar
        {...defaultProps}
        order={{ ...order, receiver: '0xdd9EB88C5C6D2A85A08a96c7F0ccccE27Cb843cb' }}
        receiverEnsName={'ihaveaname.eth'}
        stepName={OrderProgressBarStepName.FINISHED}
      />
    </Wrapper>
  ),
  '4a-cancellationFailed': () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName={OrderProgressBarStepName.CANCELLATION_FAILED} />
    </Wrapper>
  ),
  cancelling: () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName={OrderProgressBarStepName.CANCELLING} />
    </Wrapper>
  ),
  cancelled: () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName={OrderProgressBarStepName.CANCELLED} />
    </Wrapper>
  ),
  expired: () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} stepName={OrderProgressBarStepName.EXPIRED} />
    </Wrapper>
  ),
  bridgingInProgress: () => (
    <Wrapper>
      <OrderProgressBar {...defaultProps} isBridgingTrade stepName={OrderProgressBarStepName.BRIDGING_IN_PROGRESS} />
    </Wrapper>
  ),
  bridgingFailed: () => (
    <Wrapper>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock,
          bridgingStatus: SwapAndBridgeStatus.FAILED,
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            isFailed: true,
          },
        }}
        stepName={OrderProgressBarStepName.BRIDGING_FAILED}
      />
    </Wrapper>
  ),
  refundCompleted: () => (
    <Wrapper>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.REFUND_COMPLETE,
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            isRefunded: true,
          },
        }}
        stepName={OrderProgressBarStepName.REFUND_COMPLETED}
      />
    </Wrapper>
  ),
  bridgingFinished: () => (
    <Wrapper>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_BASE, '29100000'),
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '29800000'),
          },
          statusResult: {
            status: BridgeStatus.EXECUTED,
            depositTxHash: '0x080059573e09eb94b4679a5d1369c5244ef827746fec06c8e8d6f993c54f8663',
            fillTxHash: '0x851ff28340f67ebce1f530bea8665c911787767cf9563ad5aeb232110aa50651',
          },
        }}
        stepName={OrderProgressBarStepName.BRIDGING_FINISHED}
      />
    </Wrapper>
  ),
  bridgingPreparing: () => (
    <Wrapper>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingProgressContext: undefined,
          quoteBridgeContext: undefined,
          bridgingStatus: SwapAndBridgeStatus.DEFAULT,
          overview: {
            ...swapAndBridgeContextMock.overview,
            targetAmounts: undefined,
          },
        }}
        stepName={OrderProgressBarStepName.BRIDGING_IN_PROGRESS}
      />
    </Wrapper>
  ),
}

export default Fixtures
