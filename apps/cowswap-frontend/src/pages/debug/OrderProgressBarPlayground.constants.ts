import { COW_TOKEN_TO_CHAIN, TokenWithLogo, USDC } from '@cowprotocol/common-const'
import { OrderClass, OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import type { SwapAndBridgeContext } from 'modules/bridge'
import { SwapAndBridgeStatus } from 'modules/bridge'
import { OrderProgressBarProps, OrderProgressBarStepName } from 'modules/orderProgressBar'

const CHAIN_ID = SupportedChainId.MAINNET
const INPUT_TOKEN = USDC[CHAIN_ID]
const OUTPUT_TOKEN = COW_TOKEN_TO_CHAIN[CHAIN_ID] ?? INPUT_TOKEN
const BRIDGE_TARGET_TOKEN = USDC[SupportedChainId.BASE] ?? INPUT_TOKEN
const DEMO_RECIPIENT = '0x1111111111111111111111111111111111111111'
const DEMO_OWNER = DEMO_RECIPIENT.replace('0x', '')
const EXECUTED_SELL_AMOUNT = '500000'
const EXECUTED_BUY_AMOUNT = '3350000000000000000'

const DEMO_RECEIVED_AMOUNT = CurrencyAmount.fromRawAmount(
  OUTPUT_TOKEN,
  EXECUTED_BUY_AMOUNT,
) as unknown as CurrencyAmount<TokenWithLogo>

const DEMO_ORDER_API_ADDITIONAL_INFO = {
  executedSellAmount: EXECUTED_SELL_AMOUNT,
  executedBuyAmount: EXECUTED_BUY_AMOUNT,
} as Order['apiAdditionalInfo']

export type ScenarioFrame = {
  backendStatus: string
  holdMs: number
  stepName: OrderProgressBarStepName
  countdown?: number | null
  isBridgingTrade?: boolean
  swapAndBridgeContext?: SwapAndBridgeContext
}

export type Scenario = {
  id: string
  label: string
  frames: [ScenarioFrame, ...ScenarioFrame[]]
}

const DEMO_ORDER: Order = {
  id: '0xdebug-order',
  owner: DEMO_OWNER,
  status: OrderStatus.PENDING,
  creationTime: new Date().toISOString(),
  kind: OrderKind.SELL,
  class: OrderClass.MARKET,
  inputToken: INPUT_TOKEN,
  outputToken: OUTPUT_TOKEN,
  sellToken: INPUT_TOKEN.address.replace('0x', ''),
  buyToken: OUTPUT_TOKEN.address.replace('0x', ''),
  sellAmount: EXECUTED_SELL_AMOUNT,
  sellAmountBeforeFee: EXECUTED_SELL_AMOUNT,
  buyAmount: EXECUTED_BUY_AMOUNT,
  validTo: Math.floor(Date.now() / 1000) + 3600,
  appData: 'debug-playground',
  feeAmount: '0',
  partiallyFillable: false,
  signature: '1'.repeat(130),
  signingScheme: SigningScheme.EIP712,
  receiver: DEMO_OWNER,
  apiAdditionalInfo: DEMO_ORDER_API_ADDITIONAL_INFO,
}

const DEMO_SOLVERS = [
  { solver: 'baseline', displayName: 'Baseline' },
  { solver: 'barn', displayName: 'Barn' },
]

const DEMO_BRIDGE_PROVIDER = {
  name: 'Across',
  logoUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
} as SwapAndBridgeContext['bridgeProvider']

function getDemoBridgeContext(status: SwapAndBridgeStatus): SwapAndBridgeContext {
  return {
    bridgeProvider: DEMO_BRIDGE_PROVIDER,
    bridgingStatus: status,
    overview: {
      sourceChainName: 'Ethereum',
      sourceAmounts: {
        sellAmount: CurrencyAmount.fromRawAmount(INPUT_TOKEN, '500000'),
        buyAmount: DEMO_RECEIVED_AMOUNT,
      },
      targetAmounts: {
        sellAmount: DEMO_RECEIVED_AMOUNT,
        buyAmount: CurrencyAmount.fromRawAmount(BRIDGE_TARGET_TOKEN, '3330000'),
      },
      targetChainName: 'Base',
      targetCurrency: BRIDGE_TARGET_TOKEN,
      targetRecipient: DEMO_RECIPIENT,
    },
    swapResultContext: {
      intermediateToken: OUTPUT_TOKEN,
      receivedAmount: DEMO_RECEIVED_AMOUNT,
      receivedAmountUsd: null,
      surplusAmount: CurrencyAmount.fromRawAmount(INPUT_TOKEN, '1000'),
      surplusAmountUsd: null,
    },
  }
}

export const PLAYGROUND_SCENARIOS: Scenario[] = [
  {
    id: 'happyPath',
    label: 'Happy path: scheduled -> active -> executing -> traded',
    frames: [
      { stepName: OrderProgressBarStepName.INITIAL, backendStatus: 'scheduled', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.SOLVING, backendStatus: 'active', countdown: 9, holdMs: 1500 },
      { stepName: OrderProgressBarStepName.EXECUTING, backendStatus: 'executing', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.FINISHED, backendStatus: 'traded', holdMs: 0 },
    ],
  },
  {
    id: 'skipExecutingPoll',
    label: 'Missed executing poll: scheduled -> active -> open -> traded',
    frames: [
      { stepName: OrderProgressBarStepName.INITIAL, backendStatus: 'scheduled', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.SOLVING, backendStatus: 'active', countdown: 9, holdMs: 1500 },
      { stepName: OrderProgressBarStepName.DELAYED, backendStatus: 'open', holdMs: 1500 },
      { stepName: OrderProgressBarStepName.EXECUTING, backendStatus: 'traded', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.FINISHED, backendStatus: 'traded', holdMs: 0 },
    ],
  },
  {
    id: 'submissionRetry',
    label: 'Submission retry: scheduled -> active -> executing -> open -> traded',
    frames: [
      { stepName: OrderProgressBarStepName.INITIAL, backendStatus: 'scheduled', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.SOLVING, backendStatus: 'active', countdown: 9, holdMs: 1500 },
      { stepName: OrderProgressBarStepName.EXECUTING, backendStatus: 'executing', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.SUBMISSION_FAILED, backendStatus: 'open', holdMs: 1800 },
      { stepName: OrderProgressBarStepName.SOLVING, backendStatus: 'open', holdMs: 1500 },
      { stepName: OrderProgressBarStepName.EXECUTING, backendStatus: 'traded', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.FINISHED, backendStatus: 'traded', holdMs: 0 },
    ],
  },
  {
    id: 'submissionRetryWithNotFound',
    label: 'Retry with NotFound: active -> executing -> open -> notFound -> traded',
    frames: [
      { stepName: OrderProgressBarStepName.INITIAL, backendStatus: 'scheduled', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.SOLVING, backendStatus: 'active', countdown: 9, holdMs: 1500 },
      { stepName: OrderProgressBarStepName.EXECUTING, backendStatus: 'executing', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.SUBMISSION_FAILED, backendStatus: 'open', holdMs: 1800 },
      { stepName: OrderProgressBarStepName.SOLVING, backendStatus: 'notFound', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.EXECUTING, backendStatus: 'traded', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.FINISHED, backendStatus: 'traded', holdMs: 0 },
    ],
  },
  {
    id: 'fastFillFromInitial',
    label: 'Fast fill from initial: scheduled -> traded',
    frames: [
      { stepName: OrderProgressBarStepName.INITIAL, backendStatus: 'scheduled', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.FINISHED, backendStatus: 'traded', holdMs: 0 },
    ],
  },
  {
    id: 'reloadMissedFulfilledEvent',
    label: 'Reload path: scheduled -> active -> traded',
    frames: [
      { stepName: OrderProgressBarStepName.INITIAL, backendStatus: 'scheduled', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.SOLVING, backendStatus: 'active', countdown: 9, holdMs: 1500 },
      { stepName: OrderProgressBarStepName.EXECUTING, backendStatus: 'traded', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.FINISHED, backendStatus: 'traded', holdMs: 0 },
    ],
  },
  {
    id: 'bridgeContextReload',
    label: 'Bridge context reload after fill',
    frames: [
      { stepName: OrderProgressBarStepName.INITIAL, backendStatus: 'scheduled', holdMs: 1200 },
      { stepName: OrderProgressBarStepName.SOLVING, backendStatus: 'active', countdown: 9, holdMs: 1500 },
      { stepName: OrderProgressBarStepName.EXECUTING, backendStatus: 'traded', holdMs: 1200 },
      {
        stepName: OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
        backendStatus: 'traded + bridge pending',
        holdMs: 1500,
        isBridgingTrade: true,
        swapAndBridgeContext: getDemoBridgeContext(SwapAndBridgeStatus.PENDING),
      },
      {
        stepName: OrderProgressBarStepName.BRIDGING_IN_PROGRESS,
        backendStatus: 'traded + bridge context missing',
        holdMs: 1500,
        isBridgingTrade: true,
        swapAndBridgeContext: getDemoBridgeContext(SwapAndBridgeStatus.PENDING),
      },
      {
        stepName: OrderProgressBarStepName.BRIDGING_FINISHED,
        backendStatus: 'traded + bridge done',
        holdMs: 0,
        isBridgingTrade: true,
        swapAndBridgeContext: getDemoBridgeContext(SwapAndBridgeStatus.DONE),
      },
    ],
  },
  {
    id: 'cancellationRace',
    label: 'Cancellation race: cancelling -> traded',
    frames: [
      { stepName: OrderProgressBarStepName.SOLVING, backendStatus: 'active', countdown: 9, holdMs: 1500 },
      { stepName: OrderProgressBarStepName.CANCELLING, backendStatus: 'local cancelling', holdMs: 1500 },
      { stepName: OrderProgressBarStepName.CANCELLATION_FAILED, backendStatus: 'traded', holdMs: 0 },
    ],
  },
]

export function getProgressBarProps(frame: ScenarioFrame): OrderProgressBarProps {
  return {
    chainId: CHAIN_ID,
    countdown: frame.countdown,
    isBridgingTrade: !!frame.isBridgingTrade,
    isProgressBarSetup: true,
    order: DEMO_ORDER,
    showCancellationModal: null,
    solverCompetition: frame.stepName === OrderProgressBarStepName.FINISHED ? DEMO_SOLVERS : undefined,
    stepName: frame.stepName,
    swapAndBridgeContext: frame.swapAndBridgeContext,
    totalSolvers: frame.stepName === OrderProgressBarStepName.FINISHED ? 49 : undefined,
  }
}
