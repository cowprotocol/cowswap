import { USDC, WETH_MAINNET } from '@cowprotocol/common-const'
import { buildPriceFromCurrencyAmounts } from '@cowprotocol/common-utils'
import { OrderClass, OrderKind, SigningScheme } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Token } from '@cowprotocol/currency'

import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { OrderStatus } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { WarningReason } from '../../pure/OrderEstimatedExecutionPrice/orderEstimatedExecutionPrice.constants'
import { OrderTableItem } from '../../state/ordersTable.types'
import { OrdersDateGroup } from '../../utils/groupOrdersByDate.utils'

export interface MobileOrderCardScenario {
  name: string
  item: OrderTableItem
  dateGroup?: OrdersDateGroup
  warningReason?: WarningReason
}

interface BuildOrderOptions extends Partial<Omit<ParsedOrder, 'executionData'>> {
  fillPercent?: string
  withoutExecutionPrice?: boolean
  fullyFilled?: boolean
}

const buyToken = USDC[1]

if (!buyToken) throw new Error('Expected USDC on Ethereum')

// Date groups are supplied explicitly; fixed local dates keep the specimen data reproducible.
const today = new Date(2026, 7, 28, 10, 42)
const yesterday = new Date(2026, 7, 27, 10, 42)
const older = new Date(2025, 9, 20, 10, 42)

const defaultTrade = {
  inputToken: WETH_MAINNET,
  outputToken: buyToken,
  sellAmount: '1000000000000000',
  buyAmount: '1763781',
  kind: OrderKind.SELL,
}

function buildExecutionData({
  inputToken,
  outputToken,
  sellAmount,
  buyAmount,
  kind,
  fillPercent,
  withoutExecutionPrice,
  fullyFilled,
}: Pick<ParsedOrder, 'inputToken' | 'outputToken' | 'sellAmount' | 'buyAmount' | 'kind'> &
  Required<
    Pick<BuildOrderOptions, 'fillPercent' | 'withoutExecutionPrice' | 'fullyFilled'>
  >): ParsedOrder['executionData'] {
  const fill = new BigNumber(fillPercent).dividedBy(100)
  // Give executions a better price than the limit so using the wrong price is visually obvious.
  const executedSellAmount = new BigNumber(sellAmount)
    .times(fill)
    .times(kind === OrderKind.BUY ? '0.98' : '1')
    .integerValue(BigNumber.ROUND_DOWN)
    .toFixed(0)
  const executedBuyAmount = new BigNumber(buyAmount)
    .times(fill)
    .times(kind === OrderKind.SELL ? '1.02' : '1')
    .integerValue(BigNumber.ROUND_DOWN)
    .toFixed(0)
  const filledAmount = new BigNumber(kind === OrderKind.SELL ? executedSellAmount : executedBuyAmount)
  const filledPercentage = filledAmount.dividedBy(kind === OrderKind.SELL ? sellAmount : buyAmount)
  const hasExecutionPrice =
    !withoutExecutionPrice && new BigNumber(executedSellAmount).gt(0) && new BigNumber(executedBuyAmount).gt(0)

  return {
    executedBuyAmount: JSBI.BigInt(executedBuyAmount),
    executedSellAmount: JSBI.BigInt(executedSellAmount),
    filledAmount,
    filledPercentage,
    filledPercentDisplay: filledPercentage.times(100).toString(),
    fullyFilled,
    partiallyFilled: filledAmount.gt(0) && !fullyFilled,
    surplusAmount: new BigNumber(0),
    surplusPercentage: new BigNumber(0),
    executedFeeAmount: '0',
    executedFee: null,
    executedFeeToken: null,
    totalFee: null,
    activityId: undefined,
    activityTitle: 'Order ID',
    executedPrice: hasExecutionPrice
      ? buildPriceFromCurrencyAmounts(
          CurrencyAmount.fromRawAmount(inputToken, executedSellAmount),
          CurrencyAmount.fromRawAmount(outputToken, executedBuyAmount),
        )
      : null,
  }
}

function buildOrder({
  fillPercent = '0',
  withoutExecutionPrice = false,
  fullyFilled = fillPercent === '100',
  ...overrides
}: BuildOrderOptions = {}): ParsedOrder {
  const { inputToken, outputToken, sellAmount, buyAmount, kind } = { ...defaultTrade, ...overrides }

  return {
    id: 'mobile-card-fixture',
    owner: '0x4cc6e4f6014cc998fc5ef14c3f5d1184f76ae25b',
    receiver: undefined,
    isCancelling: false,
    class: OrderClass.LIMIT,
    status: OrderStatus.PENDING,
    partiallyFillable: true,
    creationTime: today,
    expirationTime: new Date(today.getTime() + 60 * 60 * 1000),
    fulfillmentTime: fullyFilled ? new Date(today.getTime() + 5 * 60 * 1000).toISOString() : undefined,
    fullAppData: undefined,
    feeAmount: '0',
    signingScheme: SigningScheme.EIP712,
    ...overrides,
    inputToken,
    outputToken,
    sellAmount,
    buyAmount,
    kind,
    executionData: buildExecutionData({
      inputToken,
      outputToken,
      sellAmount,
      buyAmount,
      kind,
      fillPercent,
      withoutExecutionPrice,
      fullyFilled,
    }),
  }
}

function scenario(
  name: string,
  options: BuildOrderOptions = {},
  warningReason?: WarningReason,
  dateGroup = OrdersDateGroup.TODAY,
): MobileOrderCardScenario {
  return { name, item: buildOrder({ ...options, id: `mobile-card-fixture-${name}` }), warningReason, dateGroup }
}

function twapScenario(
  name: string,
  parts: number,
  options: BuildOrderOptions = {},
  warningReason?: WarningReason,
): MobileOrderCardScenario {
  const parent = buildOrder({ ...options, id: `mobile-card-fixture-${name}` })
  const children = Array.from({ length: parts }, (_, index) =>
    buildOrder({ id: `${parent.id}-part-${index}`, status: OrderStatus.SCHEDULED }),
  )

  return { name, item: { parent, children }, warningReason, dateGroup: OrdersDateGroup.TODAY }
}

const longSymbolToken = new Token(1, WETH_MAINNET.address, 18, 'LONG_TOKEN_SYMBOL', 'Long symbol layout fixture')
const unnamedToken = new Token(1, WETH_MAINNET.address, 18)

export const mobileOrderCardScenarios: MobileOrderCardScenario[] = [
  scenario('Open'),
  scenario('Partially filled', { status: OrderStatus.CANCELLED, fillPercent: '64' }),
  scenario('Tiny partially filled', { status: OrderStatus.CANCELLED, fillPercent: '0.004' }),
  scenario('Filled', { status: OrderStatus.FULFILLED, fillPercent: '100' }),
  scenario('Expired - unfilled', { status: OrderStatus.EXPIRED }),
  scenario('Cancelled - unfilled', { status: OrderStatus.CANCELLED }),
  scenario('Failed - unfilled', { status: OrderStatus.FAILED }),
  scenario('Signing', { status: OrderStatus.PRESIGNATURE_PENDING }),
  scenario('Creating', { status: OrderStatus.CREATING }),
  scenario('Scheduled', { status: OrderStatus.SCHEDULED }),
  scenario('Cancelling', { isCancelling: true }),
  scenario('Cancelling - partially filled', { isCancelling: true, fillPercent: '64' }),
  scenario('Unfillable', { isUnfillable: true }),
  scenario('Open - partially filled', { fillPercent: '64' }),
  scenario('Expired - partially filled', { status: OrderStatus.EXPIRED, fillPercent: '64' }),
  scenario('Failed - partially filled', { status: OrderStatus.FAILED, fillPercent: '64' }),
  scenario('Nearly filled', { fillPercent: '99.999' }),
  scenario('Filled by tolerance', { fillPercent: '99.999', fullyFilled: true }),
  scenario('Partial fill - defensive missing-price fallback', { fillPercent: '64', withoutExecutionPrice: true }),
  scenario('Filled - defensive missing-price fallback', {
    status: OrderStatus.FULFILLED,
    fillPercent: '100',
    withoutExecutionPrice: true,
  }),
  scenario('BUY - open', { kind: OrderKind.BUY, buyAmount: '2000000' }),
  scenario('BUY - partially filled', { kind: OrderKind.BUY, buyAmount: '2000000', fillPercent: '64' }),
  scenario('BUY - filled', {
    kind: OrderKind.BUY,
    buyAmount: '2000000',
    status: OrderStatus.FULFILLED,
    fillPercent: '100',
  }),
  scenario('Insufficient balance', {}, WarningReason.Balance),
  scenario('Insufficient balance - partially filled', { fillPercent: '64' }, WarningReason.Balance),
  scenario('Insufficient allowance', {}, WarningReason.Allowance),
  scenario('Insufficient allowance - partially filled', { fillPercent: '64' }, WarningReason.Allowance),
  twapScenario('TWAP - one part', 1),
  twapScenario('TWAP - many parts', 24),
  twapScenario('TWAP - fallback handler required', 2, {}, WarningReason.FallbackHandler),
  twapScenario(
    'TWAP - fallback handler with parent execution',
    2,
    { fillPercent: '64' },
    WarningReason.FallbackHandler,
  ),
  twapScenario('TWAP - Safe parent execution is not an aggregate', 2, { fillPercent: '64' }),
  twapScenario('TWAP - EOA parent execution is not an aggregate', 2, { isEoaTwapOrder: true, fillPercent: '64' }),
  scenario('TWAP - EOA parent before grouping', { isEoaTwapOrder: true, fillPercent: '64' }),
  scenario('Long token symbol', { inputToken: longSymbolToken, fillPercent: '64' }),
  scenario('Missing token symbol', { inputToken: unnamedToken }),
  scenario('Large amounts', { sellAmount: '1234567890123456789000000', buyAmount: '2177544444444444' }),
  scenario('Tiny amounts', { sellAmount: '1000000000', buyAmount: '1' }),
  scenario('Sell amount includes fee', { feeAmount: '10000000000000' }),
  scenario('Yesterday', { creationTime: yesterday }, undefined, OrdersDateGroup.YESTERDAY),
  scenario('Older order - date and year', { creationTime: older }, undefined, OrdersDateGroup.OLDER),
  scenario(
    'Filled on a different day',
    {
      status: OrderStatus.FULFILLED,
      fillPercent: '100',
      creationTime: yesterday,
    },
    undefined,
    OrdersDateGroup.YESTERDAY,
  ),
  scenario('Filled - fulfillment time unavailable', {
    status: OrderStatus.FULFILLED,
    fillPercent: '100',
    fulfillmentTime: undefined,
  }),
]
