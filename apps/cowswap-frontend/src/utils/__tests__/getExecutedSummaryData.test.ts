import { OrderClass, OrderKind, SigningScheme, SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import BigNumber from 'bignumber.js'
import JSBI from 'jsbi'

import { OrderStatus } from 'legacy/state/orders/actions'

import { getExecutedSummaryDataWithSurplusToken } from '../getExecutedSummaryData'

import type { ParsedOrder } from '../orderUtils/parseOrder'

const toAddress = (suffix: string): string => `0x${suffix.padStart(40, '0')}`

const polygonAave = new Token(SupportedChainId.POLYGON, toAddress('1'), 18, 'AAVE', 'AAVE')
const baseEth = new Token(SupportedChainId.BASE, toAddress('2'), 18, 'ETH', 'ETH')
const polygonWeth = new Token(SupportedChainId.POLYGON, toAddress('3'), 18, 'WETH', 'WETH')
const polygonUsdc = new Token(SupportedChainId.POLYGON, toAddress('4'), 6, 'USDC', 'USDC')
const baseWeth = new Token(SupportedChainId.BASE, toAddress('5'), 18, 'WETH', 'WETH')
const baseUsdc = new Token(SupportedChainId.BASE, toAddress('6'), 6, 'USDC', 'USDC')
const mainnetWeth = new Token(SupportedChainId.MAINNET, toAddress('8'), 18, 'WETH', 'WETH')

interface BuildParsedOrderArgs {
  kind: OrderKind
  inputToken: Token
  outputToken: Token
  sellAmount: string
  buyAmount: string
  executedSellAmount: string
  executedBuyAmount: string
  surplusRaw?: string
  partiallyFillable?: boolean
  feeAmount?: string
}

function buildParsedOrder({
  kind,
  inputToken,
  outputToken,
  sellAmount,
  buyAmount,
  executedSellAmount,
  executedBuyAmount,
  surplusRaw,
  partiallyFillable = false,
  feeAmount = '0',
}: BuildParsedOrderArgs): ParsedOrder {
  const now = new Date()

  return {
    id: '0xorder',
    owner: '0xowner',
    isCancelling: false,
    isUnfillable: false,
    receiver: undefined,
    inputToken,
    outputToken,
    kind,
    sellAmount,
    buyAmount,
    feeAmount,
    class: OrderClass.LIMIT,
    status: OrderStatus.FULFILLED,
    partiallyFillable,
    creationTime: now,
    expirationTime: now,
    fulfillmentTime: now.toISOString(),
    composableCowInfo: undefined,
    fullAppData: undefined,
    signingScheme: SigningScheme.EIP712,
    executionData: {
      executedBuyAmount: JSBI.BigInt(executedBuyAmount),
      executedSellAmount: JSBI.BigInt(executedSellAmount),
      fullyFilled: !partiallyFillable,
      partiallyFilled: partiallyFillable,
      filledAmount: new BigNumber(kind === OrderKind.SELL ? executedSellAmount : executedBuyAmount),
      filledPercentage: new BigNumber(1),
      surplusAmount: new BigNumber(surplusRaw ?? '0'),
      surplusPercentage: new BigNumber(0.05),
      executedFeeAmount: '0',
      executedFee: '0',
      executedFeeToken: '0x0',
      totalFee: '0',
      filledPercentDisplay: '100',
      executedPrice: null,
      activityId: 'activity',
      activityTitle: 'Order ID',
    },
  }
}

describe('getExecutedSummaryDataWithSurplusToken', () => {
  it('uses the provided surplus token for sell bridge orders when safe', () => {
    const order = buildParsedOrder({
      kind: OrderKind.SELL,
      inputToken: polygonAave,
      outputToken: baseEth,
      sellAmount: '2000000000000000000',
      buyAmount: '1000000000000000000',
      executedSellAmount: '2000000000000000000',
      executedBuyAmount: '1050000000000000000',
      surplusRaw: '50000000000000000',
    })

    const result = getExecutedSummaryDataWithSurplusToken(order, polygonWeth)

    expect(result.formattedSwappedAmount.currency.address).toBe(polygonWeth.address)
    expect(result.formattedSwappedAmount.currency.chainId).toBe(polygonWeth.chainId)
    expect(result.surplusAmount.currency.address).toBe(polygonWeth.address)
    expect(result.surplusToken.address).toBe(polygonWeth.address)
  })

  it('covers ETH→WETH bridge scenario keeping source WETH in the summary', () => {
    const order = buildParsedOrder({
      kind: OrderKind.SELL,
      inputToken: mainnetWeth,
      outputToken: baseEth,
      sellAmount: '1000000000000000000', // 1 WETH sold
      buyAmount: '1000000000000000000', // expect 1 ETH on destination
      executedSellAmount: '1000000000000000000',
      executedBuyAmount: '1020000000000000000',
      surplusRaw: '20000000000000000', // 0.02 surplus
    })

    const result = getExecutedSummaryDataWithSurplusToken(order, mainnetWeth)

    expect(result.formattedSwappedAmount.currency.address).toBe(mainnetWeth.address)
    expect(result.formattedSwappedAmount.currency.chainId).toBe(mainnetWeth.chainId)
    expect(result.formattedSwappedAmount.toExact()).toBe('1.02')
    expect(result.surplusAmount.currency.address).toBe(mainnetWeth.address)
    expect(result.surplusAmount.toExact()).toBe('0.02')
  })

  it('keeps the parsed output token when no override is needed for sell orders', () => {
    const order = buildParsedOrder({
      kind: OrderKind.SELL,
      inputToken: polygonAave,
      outputToken: baseEth,
      sellAmount: '2000000000000000000',
      buyAmount: '1000000000000000000',
      executedSellAmount: '2000000000000000000',
      executedBuyAmount: '1050000000000000000',
      surplusRaw: '50000000000000000',
    })

    const result = getExecutedSummaryDataWithSurplusToken(order, baseEth)

    expect(result.formattedSwappedAmount.currency.address).toBe(baseEth.address)
    expect(result.formattedSwappedAmount.currency.chainId).toBe(baseEth.chainId)
    expect(result.surplusAmount.currency.address).toBe(baseEth.address)
    expect(result.surplusToken.address).toBe(baseEth.address)
  })

  it('ignores override token when decimals do not align for sell orders', () => {
    const order = buildParsedOrder({
      kind: OrderKind.SELL,
      inputToken: polygonAave,
      outputToken: baseEth,
      sellAmount: '2000000000000000000',
      buyAmount: '1000000000000000000',
      executedSellAmount: '2000000000000000000',
      executedBuyAmount: '1050000000000000000',
      surplusRaw: '50000000000000000',
    })

    const result = getExecutedSummaryDataWithSurplusToken(order, polygonUsdc)

    expect(result.formattedSwappedAmount.currency.address).toBe(baseEth.address)
    expect(result.surplusAmount.currency.address).toBe(baseEth.address)
    expect(result.surplusAmount.toExact()).toBe('0.05')
  })

  it('keeps sell order summary unchanged when override equals default surplus token', () => {
    const order = buildParsedOrder({
      kind: OrderKind.SELL,
      inputToken: polygonAave,
      outputToken: baseEth,
      sellAmount: '2000000000000000000',
      buyAmount: '1000000000000000000',
      executedSellAmount: '2000000000000000000',
      executedBuyAmount: '1050000000000000000',
      surplusRaw: '50000000000000000',
    })

    const result = getExecutedSummaryDataWithSurplusToken(order, baseEth)

    expect(result.formattedSwappedAmount.currency.address).toBe(baseEth.address)
    expect(result.surplusAmount.currency.address).toBe(baseEth.address)
    expect(result.surplusAmount.toExact()).toBe('0.05')
  })

  it('keeps buy order surplus denominated in the input token when override decimals differ', () => {
    const order = buildParsedOrder({
      kind: OrderKind.BUY,
      inputToken: polygonUsdc,
      outputToken: baseWeth,
      sellAmount: '2000000',
      buyAmount: '1000000000000000000',
      executedSellAmount: '1500000',
      executedBuyAmount: '1000000000000000000',
      surplusRaw: '500000',
    })

    const result = getExecutedSummaryDataWithSurplusToken(order, polygonWeth)

    expect(result.formattedFilledAmount.currency.address).toBe(baseWeth.address)
    expect(result.formattedFilledAmount.currency.chainId).toBe(baseWeth.chainId)
    expect(result.surplusAmount.currency.address).toBe(polygonUsdc.address)
    expect(result.surplusToken.address).toBe(polygonUsdc.address)
    expect(result.surplusAmount.toExact()).toBe('0.5')
  })

  it('does not override buy orders even when decimals align with the input token', () => {
    const order = buildParsedOrder({
      kind: OrderKind.BUY,
      inputToken: polygonUsdc,
      outputToken: baseWeth,
      sellAmount: '2000000',
      buyAmount: '1000000000000000000',
      executedSellAmount: '1500000',
      executedBuyAmount: '1000000000000000000',
      surplusRaw: '500000',
    })

    const result = getExecutedSummaryDataWithSurplusToken(order, baseUsdc)

    expect(result.formattedFilledAmount.currency.address).toBe(baseWeth.address)
    expect(result.formattedFilledAmount.currency.chainId).toBe(baseWeth.chainId)
    expect(result.surplusAmount.currency.address).toBe(polygonUsdc.address)
    expect(result.surplusToken.address).toBe(polygonUsdc.address)
    expect(result.surplusAmount.toExact()).toBe('0.5')
  })

  it('keeps buy order summary stable when override matches default surplus token', () => {
    const order = buildParsedOrder({
      kind: OrderKind.BUY,
      inputToken: polygonUsdc,
      outputToken: baseWeth,
      sellAmount: '2000000',
      buyAmount: '1000000000000000000',
      executedSellAmount: '1500000',
      executedBuyAmount: '1000000000000000000',
      surplusRaw: '500000',
    })

    const result = getExecutedSummaryDataWithSurplusToken(order, polygonUsdc)

    expect(result.formattedFilledAmount.currency.address).toBe(baseWeth.address)
    expect(result.surplusAmount.currency.address).toBe(polygonUsdc.address)
    expect(result.surplusAmount.toExact()).toBe('0.5')
  })

  it('falls back to zero surplus when execution data omits the surplus amount', () => {
    const order = buildParsedOrder({
      kind: OrderKind.SELL,
      inputToken: polygonAave,
      outputToken: baseEth,
      sellAmount: '2000000000000000000',
      buyAmount: '1000000000000000000',
      executedSellAmount: '2000000000000000000',
      executedBuyAmount: '1000000000000000000',
    })

    order.executionData.surplusAmount = undefined as unknown as BigNumber

    const result = getExecutedSummaryDataWithSurplusToken(order, polygonWeth)

    expect(result.surplusAmount.currency.address).toBe(polygonWeth.address)
    expect(result.surplusAmount.toExact()).toBe('0')
  })
})
