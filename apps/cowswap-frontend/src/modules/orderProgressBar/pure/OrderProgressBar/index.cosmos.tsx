import { useEffect, useState, ReactNode, useRef } from 'react'

import {
  USDC_BASE,
  USDC_GNOSIS_CHAIN,
  USDC_MAINNET,
  USDC_ARBITRUM_ONE,
  USDC_SEPOLIA,
  USDC_AVALANCHE,
  TokenWithLogo,
} from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { BridgeStatus } from '@cowprotocol/sdk-bridging'
import { UI } from '@cowprotocol/ui'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

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
    type: 'HookBridgeProvider',
  },
  overview: {
    sourceChainName: 'Ethereum',
    targetChainName: 'Base',
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
    chainName: 'Base',
    estimatedTime: 8,
    recipient: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
    bridgeFee: CurrencyAmount.fromRawAmount(USDC_BASE, '150000'),
    sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
    buyAmount: CurrencyAmount.fromRawAmount(USDC_BASE, '28700000'),
    buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_BASE, '28700004'),
    bridgeMinReceiveAmount: null,
    bridgeMinDepositAmount: null,
    bridgeMinDepositAmountUsd: null,
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
    receivedAmount: receiveAmountInfo.afterNetworkCosts.buyAmount as unknown as CurrencyAmount<TokenWithLogo>,
    receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_BASE, '29800000'),
    surplusAmount: CurrencyAmount.fromRawAmount(
      receiveAmountInfo.afterNetworkCosts.buyAmount.currency,
      '120000000000000000',
    ),
    surplusAmountUsd: CurrencyAmount.fromRawAmount(USDC_BASE, '1300'),
    intermediateToken: USDC_MAINNET,
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

const NarrowWrapper = styled(Wrapper)`
  width: 375px;
`

const WideWrapper = styled(Wrapper)`
  width: 720px;
`

const cloneTokenWithSymbol = (token: Token | TokenWithLogo, symbol: string): TokenWithLogo => {
  const cloned = new Token(token.chainId, token.address, token.decimals, symbol, token.name) as TokenWithLogo
  const source = token as TokenWithLogo

  if (source.logoURI) {
    cloned.logoURI = source.logoURI
  }
  if (source.tags) {
    cloned.tags = source.tags
  }
  return cloned
}

const orderWithLongSymbols: Order = {
  ...order,
  inputToken: cloneTokenWithSymbol(order.inputToken, 'VERY-LONG-ALGO-TOKEN-SYMBOL'),
  outputToken: cloneTokenWithSymbol(order.outputToken, 'WRAPPED-SUPER-STABLECOIN-WITH-AN-EXTRA-SUFFIX'),
}

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
  '4-finished-surplus-large-percent': () => (
    <WideWrapper>
      <OrderProgressBar
        {...defaultProps}
        surplusData={{ ...defaultProps.surplusData!, surplusPercent: '123.4567', showSurplus: true }}
        stepName={OrderProgressBarStepName.FINISHED}
      />
    </WideWrapper>
  ),
  '4-finished-surplus-narrow-with-long-symbols': () => (
    <NarrowWrapper>
      <OrderProgressBar
        {...defaultProps}
        order={orderWithLongSymbols}
        surplusData={{ ...defaultProps.surplusData!, surplusPercent: '5.4321', showSurplus: true }}
        stepName={OrderProgressBarStepName.FINISHED}
      />
    </NarrowWrapper>
  ),
  '4-finished-benefit-text': () => (
    <Wrapper>
      <OrderProgressBar
        {...defaultProps}
        surplusData={{ ...defaultProps.surplusData!, showSurplus: false }}
        stepName={OrderProgressBarStepName.FINISHED}
      />
    </Wrapper>
  ),
  '4-finished-benefit-text-narrow': () => (
    <NarrowWrapper>
      <OrderProgressBar
        {...defaultProps}
        chainId={SupportedChainId.MAINNET}
        surplusData={{ ...defaultProps.surplusData!, showSurplus: false }}
        stepName={OrderProgressBarStepName.FINISHED}
      />
    </NarrowWrapper>
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
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_BASE, '29800000'),
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

  // Standard bridge between two well-supported chains
  // Tests: Both chains in SupportedChainId + bridge networks
  // Validates: Normal case works perfectly, both explorer links show with correct names
  'bridging-explorer-links-eth-to-arb': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(0,150,0,0.1)', borderRadius: '8px' }}>
        <strong>✅ Standard Bridge:</strong> ETH → ARB (both in SupportedChainId + bridge networks)
        <br />
        <strong>Expected:</strong> "View on Etherscan" → "View on Arbiscan"
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          overview: {
            ...swapAndBridgeContextMock.overview,
            targetChainName: 'Arbitrum One',
            targetCurrency: USDC_ARBITRUM_ONE,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Arbitrum One',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.MAINNET,
            destinationChainId: SupportedChainId.ARBITRUM_ONE,
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '29100000'),
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '29800000'),
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

  // Unknown destination chain
  // Tests: Chain ID 99999 not in SupportedChainId OR bridge networks
  // Validates: prevents misleading Etherscan links for unknown chains
  'bridging-explorer-links-unknown-destination': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(255,140,0,0.1)', borderRadius: '8px' }}>
        <strong>🟡 Unknown Destination:</strong> ETH → Chain 99999 (not in any registry)
        <br />
        <strong>Expected:</strong> Source link only, no misleading destination link
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          overview: {
            ...swapAndBridgeContextMock.overview,
            sourceChainName: 'Ethereum',
            targetChainName: 'Unknown Chain',
            targetCurrency: USDC_MAINNET,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Unknown Chain',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_MAINNET, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_MAINNET, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.MAINNET,
            destinationChainId: 99999,
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '29100000'),
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_MAINNET, '29800000'),
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

  // Explorer indexing delay
  // Tests: depositTxHash missing due to slow explorer indexing
  // Validates: Only destination link shows (transaction exists but not indexed)
  // Real world: Source explorer slower than destination, temporary indexing lag
  'bridging-explorer-links-missing-deposit-hash': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(100,100,255,0.1)', borderRadius: '8px' }}>
        <strong>Explorer Indexing Delay:</strong> Source transaction not indexed yet
        <br />
        <strong>Expected:</strong> Destination link only (temporary state)
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          overview: {
            ...swapAndBridgeContextMock.overview,
            targetChainName: 'Arbitrum One',
            targetCurrency: USDC_ARBITRUM_ONE,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Arbitrum One',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.MAINNET,
            destinationChainId: SupportedChainId.ARBITRUM_ONE,
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '29100000'),
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '29800000'),
          },
          statusResult: {
            status: BridgeStatus.EXECUTED,
            depositTxHash: undefined,
            fillTxHash: '0x851ff28340f67ebce1f530bea8665c911787767cf9563ad5aeb232110aa50651',
          },
        }}
        stepName={OrderProgressBarStepName.BRIDGING_FINISHED}
      />
    </Wrapper>
  ),

  // Bridge transaction pending
  // Tests: fillTxHash is undefined but depositTxHash exists
  // Validates: Only source link shows, destination pending
  // Real world: Swap completed, bridge transaction submitted and in progress
  'bridging-explorer-links-missing-fill-hash': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(100,100,255,0.1)', borderRadius: '8px' }}>
        <strong>Bridge In Progress:</strong> Destination transaction in progress
        <br />
        <strong>Expected:</strong> Source link only, bridge transaction processing
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.PENDING,
          overview: {
            ...swapAndBridgeContextMock.overview,
            targetChainName: 'Arbitrum One',
            targetCurrency: USDC_ARBITRUM_ONE,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Arbitrum One',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.MAINNET,
            destinationChainId: SupportedChainId.ARBITRUM_ONE,
            receivedAmount: undefined,
            receivedAmountUsd: undefined,
          },
          statusResult: {
            status: BridgeStatus.IN_PROGRESS,
            depositTxHash: '0x080059573e09eb94b4679a5d1369c5244ef827746fec06c8e8d6f993c54f8663',
            fillTxHash: undefined,
          },
        }}
        stepName={OrderProgressBarStepName.BRIDGING_IN_PROGRESS} // More realistic step
      />
    </Wrapper>
  ),

  // Early bridge state - no transaction data yet
  // Tests: Both depositTxHash and fillTxHash are undefined
  // Validates: Clean UI with no broken links, only amount display
  // Real world: Bridge just initiated, transaction hashes not available yet
  'bridging-explorer-links-no-transactions': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(200,200,200,0.1)', borderRadius: '8px' }}>
        <strong>Bridge Initiating:</strong> No transaction data available yet
        <br />
        <strong>Expected:</strong> Clean UI, no transaction links shown
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DEFAULT,
          overview: {
            ...swapAndBridgeContextMock.overview,
            targetChainName: 'Arbitrum One',
            targetCurrency: USDC_ARBITRUM_ONE,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Arbitrum One',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.MAINNET,
            destinationChainId: SupportedChainId.ARBITRUM_ONE,
            receivedAmount: undefined,
            receivedAmountUsd: undefined,
          },
          statusResult: undefined,
        }}
        stepName={OrderProgressBarStepName.BRIDGING_IN_PROGRESS}
      />
    </Wrapper>
  ),

  // Different chains combination
  // Tests: Polygon → Base
  // Validates: Each chain uses its specific explorer (PolygonScan → BaseScan)
  // Ensures: Chain-specific explorer names are correctly resolved
  'bridging-explorer-links-polygon-to-base': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(0,150,0,0.1)', borderRadius: '8px' }}>
        <strong>✅ Different Chains:</strong> Polygon → Base
        <br />
        <strong>Expected:</strong> "View on PolygonScan" → "View on BaseScan"
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          overview: {
            ...swapAndBridgeContextMock.overview,
            sourceChainName: 'Polygon',
            targetChainName: 'Base',
            targetCurrency: USDC_BASE,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_BASE, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Base',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_BASE, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_BASE, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_BASE, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.POLYGON,
            destinationChainId: SupportedChainId.BASE,
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_BASE, '29100000'),
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_BASE, '29800000'),
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

  // LOADING STATE SCENARIO: Bridge networks still loading
  // Tests: useBridgeSupportedNetworks() returns { data: undefined, loading: true }
  // Validates: Source link works (SupportedChainId), destination gracefully fails validation
  // Real world: Component renders before bridge provider data loads
  'bridging-explorer-links-bridge-loading': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(255,200,0,0.1)', borderRadius: '8px' }}>
        <strong>⏳ Bridge Networks Loading:</strong> useBridgeSupportedNetworks returns undefined
        <br />
        <strong>Expected:</strong> Source link works, destination validation gracefully fails
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          overview: {
            ...swapAndBridgeContextMock.overview,
            targetChainName: 'Arbitrum One',
            targetCurrency: USDC_ARBITRUM_ONE,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Arbitrum One',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.MAINNET,
            destinationChainId: SupportedChainId.ARBITRUM_ONE,
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '29100000'),
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '29800000'),
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

  // EMPTY STRING EDGE CASE: Different falsy behavior
  // Tests: Transaction hashes are "" (empty string) not undefined
  // Validates: Empty strings are falsy so no links show (same as undefined)
  // Edge case: Some APIs return "" instead of null/undefined for missing data
  'bridging-explorer-links-empty-string-hashes': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(255,100,100,0.1)', borderRadius: '8px' }}>
        <strong>🔗 Empty String Hashes:</strong> Transaction hashes are "" not undefined
        <br />
        <strong>Expected:</strong> No transaction links (empty strings are falsy)
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          overview: {
            ...swapAndBridgeContextMock.overview,
            targetChainName: 'Arbitrum One',
            targetCurrency: USDC_ARBITRUM_ONE,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Arbitrum One',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.MAINNET,
            destinationChainId: SupportedChainId.ARBITRUM_ONE,
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '29100000'),
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_ARBITRUM_ONE, '29800000'),
          },
          statusResult: {
            status: BridgeStatus.EXECUTED,
            depositTxHash: '',
            fillTxHash: '',
          },
        }}
        stepName={OrderProgressBarStepName.BRIDGING_FINISHED}
      />
    </Wrapper>
  ),

  // UNUSUAL EDGE CASE: Same chain "bridge"
  // Tests: sourceChainId === destinationChainId (both Ethereum)
  // Validates: Both links point to same explorer, no conflicts or errors
  'bridging-explorer-links-same-chain': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(200,100,255,0.1)', borderRadius: '8px' }}>
        <strong>🔄 Same Chain Bridge:</strong> ETH → ETH (likely not possible but just in case)
        <br />
        <strong>Expected:</strong> Both links show same explorer (Etherscan)
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          overview: {
            ...swapAndBridgeContextMock.overview,
            sourceChainName: 'Ethereum',
            targetChainName: 'Ethereum',
            targetCurrency: USDC_MAINNET,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Ethereum',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_MAINNET, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_MAINNET, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.MAINNET,
            destinationChainId: SupportedChainId.MAINNET,
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '29100000'),
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_MAINNET, '29800000'),
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

  // GNOSIS CHAIN VALIDATION: Specific chain behavior
  // Tests: ETH → Gnosis Chain (different explorer URL structure)
  // Validates: Gnosis Chain explorer names and URLs work correctly
  'bridging-explorer-links-gnosis-chain': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(0,200,150,0.1)', borderRadius: '8px' }}>
        <strong>🟢 Gnosis Chain Test:</strong> ETH → Gnosis Chain
        <br />
        <strong>Expected:</strong> "View on Etherscan" → "View on Gnosis Chain Explorer"
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          overview: {
            ...swapAndBridgeContextMock.overview,
            sourceChainName: 'Ethereum',
            targetChainName: 'Gnosis Chain',
            targetCurrency: USDC_GNOSIS_CHAIN,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Gnosis Chain',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.MAINNET,
            destinationChainId: SupportedChainId.GNOSIS_CHAIN,
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_GNOSIS_CHAIN, '29100000'),
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

  // TESTNET SCENARIO: Development/testing chains
  // Tests: Sepolia testnet (development environment)
  // Validates: Testnet explorers work correctly (Sepolia Etherscan)
  'bridging-explorer-links-testnet': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(150,150,150,0.1)', borderRadius: '8px' }}>
        <strong>🧪 Testnet Scenario:</strong> Sepolia testnet
        <br />
        <strong>Expected:</strong> "View on Sepolia Etherscan" links
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          overview: {
            ...swapAndBridgeContextMock.overview,
            sourceChainName: 'Sepolia',
            targetChainName: 'Sepolia',
            targetCurrency: USDC_SEPOLIA,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Sepolia',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.SEPOLIA,
            destinationChainId: SupportedChainId.SEPOLIA, // Testnet self-bridge
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, '29100000'),
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_SEPOLIA, '29800000'),
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

  // AVALANCHE VALIDATION: Specific explorer branding
  // Tests: ETH → Avalanche (uses SnowTrace, not "Avalanche Explorer")
  // Validates: Chain-specific explorer names are correctly resolved
  'bridging-explorer-links-avalanche': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(255,100,100,0.1)', borderRadius: '8px' }}>
        <strong>🔺 Avalanche Test:</strong> ETH → Avalanche
        <br />
        <strong>Expected:</strong> "View on Etherscan" → "View on SnowTrace"
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          overview: {
            ...swapAndBridgeContextMock.overview,
            sourceChainName: 'Ethereum',
            targetChainName: 'Avalanche',
            targetCurrency: USDC_AVALANCHE,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_AVALANCHE, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Avalanche',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_AVALANCHE, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_AVALANCHE, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_AVALANCHE, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.MAINNET,
            destinationChainId: SupportedChainId.AVALANCHE,
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_AVALANCHE, '29100000'),
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_AVALANCHE, '29800000'),
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

  // Bridge-only chain support
  // Tests: Chain 8888 exists ONLY in bridge networks, NOT in SupportedChainId
  // Validates: destinationChainId validation using bridge networks (not CHAIN_INFO)
  // Ensures: Bridge explorer links work even for unsupported chains
  'bridging-explorer-links-bridge-only-chain': () => (
    <Wrapper>
      <div style={{ marginBottom: '16px', padding: '8px', background: 'rgba(255,0,150,0.1)', borderRadius: '8px' }}>
        <strong>🌉 Bridge-Only Chain:</strong> ETH → Custom L2 (in bridge networks, NOT in SupportedChainId)
        <br />
        <strong>Expected:</strong> Source link + Bridge explorer link
      </div>
      <OrderProgressBar
        {...defaultProps}
        isBridgingTrade
        swapAndBridgeContext={{
          ...swapAndBridgeContextMock!,
          bridgingStatus: SwapAndBridgeStatus.DONE,
          overview: {
            ...swapAndBridgeContextMock.overview,
            sourceChainName: 'Ethereum',
            targetChainName: 'Custom L2',
            targetCurrency: USDC_MAINNET,
            targetAmounts: {
              sellAmount: receiveAmountInfo.afterSlippage.buyAmount,
              buyAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '28700000'),
            },
          },
          quoteBridgeContext: {
            ...swapAndBridgeContextMock.quoteBridgeContext!,
            chainName: 'Custom L2',
            bridgeFee: CurrencyAmount.fromRawAmount(USDC_MAINNET, '150000'),
            buyAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '28700000'),
            buyAmountUsd: CurrencyAmount.fromRawAmount(USDC_MAINNET, '28700004'),
          },
          bridgingProgressContext: {
            ...swapAndBridgeContextMock.bridgingProgressContext!,
            account,
            sourceChainId: SupportedChainId.MAINNET,
            destinationChainId: 8888, // Custom L2 - NOT in SupportedChainId
            receivedAmount: CurrencyAmount.fromRawAmount(USDC_MAINNET, '29100000'),
            receivedAmountUsd: CurrencyAmount.fromRawAmount(USDC_MAINNET, '29800000'),
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
        stepName={OrderProgressBarStepName.BRIDGING_FINISHED}
      />
    </Wrapper>
  ),
}

export default Fixtures
