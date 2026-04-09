import { COW_TOKEN_TO_CHAIN, TokenWithLogo, USDC } from '@cowprotocol/common-const'
import { OrderClass, OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@cowprotocol/currency'

import { Order, OrderStatus } from 'legacy/state/orders/actions'

import type { SwapAndBridgeContext } from 'modules/bridge'
import { OrderProgressBarProps, OrderProgressBarStepName } from 'modules/orderProgressBar'

const CHAIN_ID = SupportedChainId.MAINNET
const INPUT_TOKEN = USDC[CHAIN_ID]
const OUTPUT_TOKEN = COW_TOKEN_TO_CHAIN[CHAIN_ID] ?? INPUT_TOKEN
const BRIDGE_TARGET_TOKEN = USDC[SupportedChainId.BASE] ?? INPUT_TOKEN
const DEMO_RECIPIENT = '0x1111111111111111111111111111111111111111'
const DEMO_OWNER = DEMO_RECIPIENT.replace('0x', '')
const EXECUTED_SELL_AMOUNT = '500000'
const EXECUTED_BUY_AMOUNT = '3350000000000000000'
const DEMO_SOLVERS = [
  { solver: 'baseline', displayName: 'Baseline' },
  { solver: 'barn', displayName: 'Barn' },
]

const DEMO_RECEIVED_AMOUNT = CurrencyAmount.fromRawAmount(
  OUTPUT_TOKEN,
  EXECUTED_BUY_AMOUNT,
) as CurrencyAmount<TokenWithLogo>

const DEMO_ORDER_API_ADDITIONAL_INFO = {
  executedSellAmount: EXECUTED_SELL_AMOUNT,
  executedBuyAmount: EXECUTED_BUY_AMOUNT,
} as Order['apiAdditionalInfo']

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

const DEMO_BRIDGE_PROVIDER = {
  name: 'Across',
  logoUrl: 'data:image/gif;base64,R0lGODlhAQABAAAAACw=',
} as SwapAndBridgeContext['bridgeProvider']

export const PLAYGROUND_ACTIVE_COUNTDOWN = 15

export type ScenarioFrame = {
  backendStatus: string
  holdMs: number
  stepName: OrderProgressBarStepName
  countdown?: number | null
  isBridgingTrade?: boolean
  swapAndBridgeContext?: SwapAndBridgeContext
}

export function getDemoBridgeContext(bridgingStatus: SwapAndBridgeContext['bridgingStatus']): SwapAndBridgeContext {
  return {
    bridgeProvider: DEMO_BRIDGE_PROVIDER,
    bridgingStatus,
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
