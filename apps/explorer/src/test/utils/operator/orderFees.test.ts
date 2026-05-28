import BigNumber from 'bignumber.js'
import { getFees } from 'utils'

import { Order, Trade } from 'api/operator'

import { ZERO_BIG_NUMBER } from '../../../const'
import { RAW_TRADE, RICH_ORDER } from '../../data'

const FEE_TOKEN = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const OTHER_TOKEN = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    ...RICH_ORDER,
    executedFeeToken: FEE_TOKEN,
    totalFee: new BigNumber('1000'),
    ...overrides,
  }
}

function makeTrade(executedProtocolFees: Trade['executedProtocolFees']): Trade {
  return {
    ...RAW_TRADE,
    orderId: RAW_TRADE.orderUid,
    buyAmount: new BigNumber(RAW_TRADE.buyAmount),
    sellAmount: new BigNumber(RAW_TRADE.sellAmount),
    sellAmountBeforeFees: new BigNumber(RAW_TRADE.sellAmountBeforeFees),
    buyTokenAddress: RAW_TRADE.buyToken,
    sellTokenAddress: RAW_TRADE.sellToken,
    executionTime: null,
    executedProtocolFees,
  }
}

describe('getFees', () => {
  let warnSpy: jest.SpyInstance

  beforeEach(() => {
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
  })

  afterEach(() => {
    warnSpy.mockRestore()
  })

  const NO_FEES = { networkCosts: undefined, protocolFees: undefined, protocolFeeTokenAddress: undefined }

  test('returns undefineds when there are no trades', () => {
    expect(getFees(makeOrder(), [])).toEqual(NO_FEES)
  })

  test('returns undefineds when no trade has protocol fees', () => {
    const trades = [makeTrade(undefined), makeTrade([])]
    expect(getFees(makeOrder(), trades)).toEqual(NO_FEES)
  })

  test('returns undefineds and warns when fees span multiple tokens', () => {
    const trades = [makeTrade([{ amount: '100', token: FEE_TOKEN }]), makeTrade([{ amount: '50', token: OTHER_TOKEN }])]
    expect(getFees(makeOrder(), trades)).toEqual(NO_FEES)
    expect(warnSpy).toHaveBeenCalled()
  })

  test('keeps protocolFees in its own token when fee token differs from executedFeeToken (surplus side)', () => {
    const trades = [makeTrade([{ amount: '100', token: OTHER_TOKEN }])]
    const result = getFees(makeOrder({ executedFeeToken: FEE_TOKEN, totalFee: new BigNumber('1000') }), trades)
    expect(result.protocolFees?.toString()).toBe('100')
    expect(result.protocolFeeTokenAddress).toBe(OTHER_TOKEN)
    // totalFee is already pure network cost when denominations differ — no subtraction
    expect(result.networkCosts?.toString()).toBe('1000')
    expect(warnSpy).not.toHaveBeenCalled()
  })

  test('subtracts protocolFees from totalFee when both are in the same token', () => {
    const trades = [makeTrade([{ amount: '300', token: FEE_TOKEN }]), makeTrade([{ amount: '200', token: FEE_TOKEN }])]
    const result = getFees(makeOrder({ totalFee: new BigNumber('1000') }), trades)
    expect(result.protocolFees?.toString()).toBe('500')
    expect(result.networkCosts?.toString()).toBe('500')
    expect(result.protocolFeeTokenAddress).toBe(FEE_TOKEN)
  })

  test('matches token addresses case-insensitively for the same-token branch', () => {
    const trades = [makeTrade([{ amount: '100', token: FEE_TOKEN.toLowerCase() }])]
    const result = getFees(
      makeOrder({ executedFeeToken: FEE_TOKEN.toUpperCase(), totalFee: new BigNumber('500') }),
      trades,
    )
    expect(result.protocolFees?.toString()).toBe('100')
    expect(result.networkCosts?.toString()).toBe('400')
  })

  test('clamps negative networkCosts to zero in same-token case', () => {
    const trades = [makeTrade([{ amount: '5000', token: FEE_TOKEN }])]
    const result = getFees(makeOrder({ totalFee: new BigNumber('1000') }), trades)
    expect(result.protocolFees?.toString()).toBe('5000')
    expect(result.networkCosts).toEqual(ZERO_BIG_NUMBER)
  })

  test('ignores fee entries with missing amount or token', () => {
    const trades = [makeTrade([{ amount: '100', token: FEE_TOKEN }, { token: FEE_TOKEN }, { amount: '50' }])]
    const result = getFees(makeOrder({ totalFee: new BigNumber('300') }), trades)
    expect(result.protocolFees?.toString()).toBe('100')
    expect(result.networkCosts?.toString()).toBe('200')
  })
})
