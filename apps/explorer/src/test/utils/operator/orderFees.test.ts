import BigNumber from 'bignumber.js'
import { getProtocolFees } from 'utils'

import { ProtocolFeeType, Trade } from 'api/operator'

import { RAW_TRADE } from '../../data'

const FEE_TOKEN = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
const OTHER_TOKEN = '0xdAC17F958D2ee523a2206206994597C13D831ec7'

type Policy = NonNullable<Trade['executedProtocolFees']>[number]['policy']

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

describe('getProtocolFees', () => {
  test('returns an empty list when there are no trades', () => {
    expect(getProtocolFees([])).toEqual([])
  })

  test('returns an empty list when no trade has protocol fees', () => {
    expect(getProtocolFees([makeTrade(undefined), makeTrade([])])).toEqual([])
  })

  test('returns a single protocol fee, normalizing the token to a lowercase AddressKey', () => {
    const result = getProtocolFees([makeTrade([{ amount: '100', token: FEE_TOKEN }])])
    expect(result).toHaveLength(1)
    expect(result[0].amount.toString()).toBe('100')
    expect(result[0].tokenAddress).toBe(FEE_TOKEN.toLowerCase())
  })

  test('keeps fees in different tokens separate', () => {
    const trades = [
      makeTrade([
        { amount: '100', token: FEE_TOKEN },
        { amount: '50', token: OTHER_TOKEN },
      ]),
    ]
    const result = getProtocolFees(trades)
    expect(result).toEqual([
      { amount: new BigNumber('100'), tokenAddress: FEE_TOKEN.toLowerCase(), type: ProtocolFeeType.Unknown },
      { amount: new BigNumber('50'), tokenAddress: OTHER_TOKEN.toLowerCase(), type: ProtocolFeeType.Unknown },
    ])
  })

  test('tags each fee with its policy type, preserving the order they were applied', () => {
    const surplusPolicy: Policy = { surplus: { factor: 0.5, maxVolumeFactor: 0.01 } }
    const volumePolicy: Policy = { volume: { factor: 0.0002 } }
    const priceImprovementPolicy: Policy = {
      priceImprovement: { factor: 0.5, maxVolumeFactor: 0.0098, quote: { sellAmount: '1', buyAmount: '1', fee: '0' } },
    }

    const trades = [
      makeTrade([
        { amount: '100', token: FEE_TOKEN, policy: surplusPolicy },
        { amount: '50', token: FEE_TOKEN, policy: volumePolicy },
        { amount: '25', token: FEE_TOKEN, policy: priceImprovementPolicy },
      ]),
    ]
    const result = getProtocolFees(trades)
    expect(result.map((fee) => fee.type)).toEqual([
      ProtocolFeeType.Surplus,
      ProtocolFeeType.Volume,
      ProtocolFeeType.PriceImprovement,
    ])
  })

  test('falls back to Unknown when no fee policy is present', () => {
    const result = getProtocolFees([makeTrade([{ amount: '100', token: FEE_TOKEN }])])
    expect(result[0].type).toBe(ProtocolFeeType.Unknown)
  })

  test('captures the policy factor so volume fees can be labeled with their bps', () => {
    const trades = [
      makeTrade([
        { amount: '50', token: FEE_TOKEN, policy: { volume: { factor: 0.0002 } } },
        { amount: '100', token: FEE_TOKEN, policy: { volume: { factor: 0.0025 } } },
      ]),
    ]
    const result = getProtocolFees(trades)
    expect(result.map((fee) => fee.factor)).toEqual([0.0002, 0.0025])
  })

  test('leaves factor undefined when no fee policy is present', () => {
    const result = getProtocolFees([makeTrade([{ amount: '100', token: FEE_TOKEN }])])
    expect(result[0].factor).toBeUndefined()
  })

  test('skips fees with a non-positive amount', () => {
    const trades = [
      makeTrade([
        { amount: '0', token: FEE_TOKEN },
        { amount: '100', token: FEE_TOKEN },
      ]),
    ]
    const result = getProtocolFees(trades)
    expect(result.map((fee) => fee.amount.toString())).toEqual(['100'])
  })

  test('keeps fees in the same token separate instead of aggregating them', () => {
    const trades = [makeTrade([{ amount: '300', token: FEE_TOKEN }]), makeTrade([{ amount: '200', token: FEE_TOKEN }])]
    const result = getProtocolFees(trades)
    expect(result.map((fee) => fee.amount.toString())).toEqual(['300', '200'])
    expect(result.every((fee) => fee.tokenAddress === FEE_TOKEN.toLowerCase())).toBe(true)
  })

  test('collects fees across multiple trades, preserving order', () => {
    const trades = [makeTrade([{ amount: '100', token: FEE_TOKEN }]), makeTrade([{ amount: '50', token: OTHER_TOKEN }])]
    const result = getProtocolFees(trades)
    expect(result.map((fee) => fee.amount.toString())).toEqual(['100', '50'])
  })

  test('ignores fee entries with missing amount or token', () => {
    const trades = [makeTrade([{ amount: '100', token: FEE_TOKEN }, { token: FEE_TOKEN }, { amount: '50' }])]
    const result = getProtocolFees(trades)
    expect(result).toHaveLength(1)
    expect(result[0].amount.toString()).toBe('100')
  })
})
