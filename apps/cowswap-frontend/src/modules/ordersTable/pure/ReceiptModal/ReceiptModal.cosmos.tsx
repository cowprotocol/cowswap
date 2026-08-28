import { ReactNode } from 'react'

import { COW_TOKEN_TO_CHAIN, WETH_MAINNET } from '@cowprotocol/common-const'
import { buildPriceFromCurrencyAmounts } from '@cowprotocol/common-utils'
import { OrderClass, OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Fraction, Token } from '@cowprotocol/currency'

import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { OrderStatus } from 'legacy/state/orders/actions'

import type { TwapOrderItem } from 'modules/twap'

import { ParsedOrder, ParsedOrderExecutionData } from 'utils/orderUtils/parseOrder'

import { ReceiptModal } from './ReceiptModal.modal'

const CHAIN_ID = SupportedChainId.MAINNET
const OWNER = '0x4cc6e4f6014cc998fc5ef14c3f5d1184f76ae25b'
const CUSTOM_RECIPIENT = '0x1111111111111111111111111111111111111111'
const SAFE_ADDRESS = '0x2222222222222222222222222222222222222222'
const ORDER_ID =
  '0x62baf4be8adec4766d26a2169999cc170c3ead90ae11a28d658e6d75edc05b185b0abe214ab7875562adee331deff0fe1912fe42644d2bb7'
const TWAP_PARENT_ID = '0x3333333333333333333333333333333333333333333333333333333333333333'
const SELL_AMOUNT = '1000000000000000'
const MINIMUM_BUY_AMOUNT = '16906321000000000000'
const EXECUTED_BUY_AMOUNT = '16935374400000000000'
const SURPLUS_AMOUNT = '29053000000000000'
const AVERAGE_MONTH_DURATION_MS = 2_629_800_000
const CREATION_TIME = new Date(Date.now() - 9 * AVERAGE_MONTH_DURATION_MS)
const COW_TOKEN = getCowToken()

function getCowToken(): Token {
  const token = COW_TOKEN_TO_CHAIN[CHAIN_ID]

  if (!token) {
    throw new Error(`COW token not found for chain ${CHAIN_ID}`)
  }

  return token
}

const PARTNER_FEE_APP_DATA = JSON.stringify({
  version: '1.12.0',
  appCode: 'CoW Swap',
  metadata: {
    orderClass: { orderClass: 'limit' },
    partnerFee: { volumeBps: 10, recipient: OWNER },
  },
})

interface BuildOrderOptions {
  suffix: string
  status: OrderStatus
  kind?: OrderKind
  fillBps?: number
  withSurplus?: boolean
  withPartnerFee?: boolean
  isCancelling?: boolean
  isEoaTwapOrder?: boolean
  isUnfillable?: boolean
  receiver?: string
  composableCowInfo?: ParsedOrder['composableCowInfo']
}

interface ReceiptFixtureProps {
  order: ParsedOrder
  twapOrder?: TwapOrderItem | null
  isTwapPartOrder?: boolean
  receiverEnsName?: string | null
  estimatedExecutionPrice?: Fraction | null
  showCancellation?: boolean
  showRecreate?: boolean
}

function buildOrder({
  suffix,
  status,
  kind = OrderKind.SELL,
  fillBps = 0,
  withSurplus = false,
  withPartnerFee = false,
  isCancelling = false,
  isEoaTwapOrder,
  isUnfillable,
  receiver = OWNER,
  composableCowInfo,
}: BuildOrderOptions): ParsedOrder {
  const executedSellAmount = scaleRawAmount(SELL_AMOUNT, fillBps)
  const executedBuyAmount = scaleRawAmount(EXECUTED_BUY_AMOUNT, fillBps)
  const sellAmount = CurrencyAmount.fromRawAmount(WETH_MAINNET, executedSellAmount)
  const buyAmount = CurrencyAmount.fromRawAmount(COW_TOKEN, executedBuyAmount)
  const hasFill = fillBps > 0
  const fullyFilled = fillBps === 10_000
  const surplusAmount = withSurplus ? SURPLUS_AMOUNT : '0'

  return {
    id: `${ORDER_ID.slice(0, -2)}${suffix}`,
    owner: OWNER,
    receiver,
    inputToken: WETH_MAINNET,
    outputToken: COW_TOKEN,
    kind,
    sellAmount: SELL_AMOUNT,
    buyAmount: MINIMUM_BUY_AMOUNT,
    feeAmount: '0',
    class: OrderClass.LIMIT,
    status,
    partiallyFillable: true,
    creationTime: CREATION_TIME,
    expirationTime: new Date(CREATION_TIME.getTime() + AVERAGE_MONTH_DURATION_MS),
    fulfillmentTime: status === OrderStatus.FULFILLED ? CREATION_TIME.toISOString() : undefined,
    fullAppData: withPartnerFee ? PARTNER_FEE_APP_DATA : undefined,
    signingScheme: SigningScheme.EIP712,
    isCancelling,
    isEoaTwapOrder,
    isUnfillable,
    composableCowInfo,
    executionData: {
      executedBuyAmount: JSBI.BigInt(executedBuyAmount),
      executedSellAmount: JSBI.BigInt(executedSellAmount),
      filledPercentage: new BigNumber(fillBps).dividedBy(10_000),
      filledAmount: new BigNumber(kind === OrderKind.SELL ? executedSellAmount : executedBuyAmount),
      filledPercentDisplay: new BigNumber(fillBps).dividedBy(100).toString(),
      fullyFilled,
      partiallyFilled: hasFill && !fullyFilled,
      surplusAmount: new BigNumber(surplusAmount),
      surplusPercentage: hasFill ? new BigNumber(surplusAmount).dividedBy(executedBuyAmount) : new BigNumber(0),
      executedFeeAmount: '0',
      executedFee: null,
      executedFeeToken: null,
      totalFee: null,
      executedPrice: hasFill ? buildPriceFromCurrencyAmounts(sellAmount, buyAmount) : null,
      activityId: `${ORDER_ID.slice(0, -2)}${suffix}`,
      activityTitle: 'Order ID',
    } satisfies ParsedOrderExecutionData,
  }
}

function getEstimatedPrice(order: ParsedOrder): Fraction {
  return buildPriceFromCurrencyAmounts(
    CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount),
    CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount),
  )
}

function ReceiptFixture({
  order,
  twapOrder = null,
  isTwapPartOrder = false,
  receiverEnsName = null,
  estimatedExecutionPrice = null,
  showCancellation = false,
  showRecreate = false,
}: ReceiptFixtureProps): ReactNode {
  const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount)
  const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount)
  const limitPrice = buildPriceFromCurrencyAmounts(sellAmount, buyAmount)

  return (
    <ReceiptModal
      isOpen
      order={order}
      receiverEnsName={receiverEnsName}
      twapOrder={twapOrder}
      isTwapPartOrder={isTwapPartOrder}
      chainId={CHAIN_ID}
      onDismiss={() => undefined}
      buyAmount={buyAmount}
      limitPrice={limitPrice}
      executionPrice={order.executionData.executedPrice}
      estimatedExecutionPrice={estimatedExecutionPrice}
      showCancellationModal={showCancellation ? () => undefined : null}
      alternativeOrderModalContext={
        showRecreate
          ? {
              isEdit: false,
              showAlternativeOrderModal: () => undefined,
            }
          : undefined
      }
    />
  )
}

function scaleRawAmount(amount: string, fillBps: number): string {
  return new BigNumber(amount).times(fillBps).dividedBy(10_000).integerValue().toFixed(0)
}

const filledLimit = buildOrder({
  suffix: '01',
  status: OrderStatus.FULFILLED,
  fillBps: 10_000,
  withSurplus: true,
  withPartnerFee: true,
})
const filledBuy = buildOrder({ suffix: '02', status: OrderStatus.FULFILLED, kind: OrderKind.BUY, fillBps: 10_000 })
const openLimit = buildOrder({ suffix: '03', status: OrderStatus.PENDING })
const partiallyFilled = buildOrder({ suffix: '04', status: OrderStatus.PENDING, fillBps: 5_000, withSurplus: true })
const cancelled = buildOrder({ suffix: '05', status: OrderStatus.CANCELLED })
const expired = buildOrder({ suffix: '06', status: OrderStatus.EXPIRED })
const failed = buildOrder({ suffix: '07', status: OrderStatus.FAILED })
const signing = buildOrder({ suffix: '08', status: OrderStatus.PRESIGNATURE_PENDING })
const creating = buildOrder({ suffix: '09', status: OrderStatus.CREATING })
const unfillable = buildOrder({ suffix: '0a', status: OrderStatus.PENDING, isUnfillable: true })
const cancelling = buildOrder({ suffix: '0b', status: OrderStatus.PENDING, isCancelling: true })
const twapParent = buildOrder({
  suffix: '0c',
  status: OrderStatus.PENDING,
  fillBps: 5_000,
  withSurplus: true,
  isEoaTwapOrder: true,
  composableCowInfo: { id: TWAP_PARENT_ID },
})
const realTwapPart = buildOrder({
  suffix: '0d',
  status: OrderStatus.FULFILLED,
  fillBps: 10_000,
  withSurplus: true,
  isEoaTwapOrder: true,
  composableCowInfo: { parentId: TWAP_PARENT_ID, isVirtualPart: false },
})
const virtualTwapPart = buildOrder({
  suffix: '0e',
  status: OrderStatus.SCHEDULED,
  isEoaTwapOrder: true,
  composableCowInfo: { parentId: TWAP_PARENT_ID, isVirtualPart: true },
})
const safeTwapPart = buildOrder({
  suffix: '0f',
  status: OrderStatus.PENDING,
  fillBps: 2_500,
  receiver: SAFE_ADDRESS,
  composableCowInfo: { parentId: TWAP_PARENT_ID, isVirtualPart: false },
})
const customRecipient = buildOrder({
  suffix: '10',
  status: OrderStatus.PENDING,
  receiver: CUSTOM_RECIPIENT,
})

const EOA_TWAP = {
  order: { n: 3 },
  resolvedOwner: OWNER,
} as unknown as TwapOrderItem

const SAFE_TWAP = {
  order: { n: 4 },
  resolvedOwner: SAFE_ADDRESS,
  safeAddress: SAFE_ADDRESS,
  safeTxParams: {
    safeTxHash: '0x4444444444444444444444444444444444444444444444444444444444444444',
    nonce: '7',
    confirmations: 1,
    confirmationsRequired: 2,
  },
} as unknown as TwapOrderItem

const Fixtures = {
  'Filled Limit · sell + surplus + fee': (
    <ReceiptFixture order={filledLimit} receiverEnsName="fairlight.eth" showRecreate />
  ),
  'Filled Limit · buy + no surplus': <ReceiptFixture order={filledBuy} showRecreate />,
  'Open Limit · unfilled + estimated price + actions': (
    <ReceiptFixture order={openLimit} estimatedExecutionPrice={getEstimatedPrice(openLimit)} showCancellation />
  ),
  'Open Limit · partially filled + actual execution': <ReceiptFixture order={partiallyFilled} showCancellation />,
  'Cancelled Limit · not filled': <ReceiptFixture order={cancelled} showRecreate />,
  'Expired Limit · not filled': <ReceiptFixture order={expired} showRecreate />,
  'Failed Limit · not filled': <ReceiptFixture order={failed} showRecreate />,
  'Signing Limit': <ReceiptFixture order={signing} />,
  'Creating Limit · cancellable': <ReceiptFixture order={creating} showCancellation />,
  'Open Limit · unfillable': (
    <ReceiptFixture order={unfillable} estimatedExecutionPrice={getEstimatedPrice(unfillable)} showCancellation />
  ),
  'Open Limit · cancelling': (
    <ReceiptFixture order={cancelling} estimatedExecutionPrice={getEstimatedPrice(cancelling)} />
  ),
  'EOA TWAP · parent totals hidden': <ReceiptFixture order={twapParent} twapOrder={EOA_TWAP} />,
  'EOA TWAP · filled real part': <ReceiptFixture order={realTwapPart} twapOrder={EOA_TWAP} isTwapPartOrder />,
  'EOA TWAP · scheduled virtual part': <ReceiptFixture order={virtualTwapPart} twapOrder={EOA_TWAP} isTwapPartOrder />,
  'Safe TWAP · partially filled part + metadata': (
    <ReceiptFixture order={safeTwapPart} twapOrder={SAFE_TWAP} isTwapPartOrder showCancellation />
  ),
  'Open Limit · custom recipient warning': (
    <ReceiptFixture
      order={customRecipient}
      estimatedExecutionPrice={getEstimatedPrice(customRecipient)}
      showCancellation
    />
  ),
}

export default Fixtures
