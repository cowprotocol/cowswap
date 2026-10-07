import { getAddressKey } from '@cowprotocol/cow-sdk'

import { msg } from '@lingui/core/macro'

import { SurplusConversionContext, toSurplusTokenCosts } from './surplusTokenCosts.utils'

import { CostLineItem } from '../types/orderCostsAndFees.types'

const NATIVE = getAddressKey('0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee')
const WETH = getAddressKey('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
const USDC = getAddressKey('0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48')
const UNKNOWN = getAddressKey('0x1111111111111111111111111111111111111111')

const ONE_WETH = 10n ** 18n
const USDC_2500 = 2500n * 10n ** 6n
// 1 USDC atom = 1e-6 / 2500 ETH = 4e8 wei
const USDC_NATIVE_PRICE = 4e8

function item(tokenAddress: CostLineItem['tokenAddress'], amount: bigint): CostLineItem {
  return { label: msg`Protocol fee`, tokenAddress, amount }
}

// Sell 1 WETH for 2500 USDC: surplus token is USDC.
const SELL_WETH_FOR_USDC: SurplusConversionContext = {
  surplusKey: USDC,
  otherKey: WETH,
  nativeKey: NATIVE,
  wrappedNativeKey: WETH,
  isSell: true,
  executedSellAmount: ONE_WETH,
  executedBuyAmount: USDC_2500,
  surplusNativePrice: USDC_NATIVE_PRICE,
}

// Buy 1 WETH with 2500 USDC: surplus token is USDC (the sell token).
const BUY_WETH_WITH_USDC: SurplusConversionContext = {
  ...SELL_WETH_FOR_USDC,
  isSell: false,
  executedSellAmount: USDC_2500,
  executedBuyAmount: ONE_WETH,
}

// Sell 2500 USDC for 1 WETH: surplus token is WETH.
const SELL_USDC_FOR_WETH: SurplusConversionContext = {
  ...SELL_WETH_FOR_USDC,
  surplusKey: WETH,
  otherKey: USDC,
  executedSellAmount: USDC_2500,
  executedBuyAmount: ONE_WETH,
  surplusNativePrice: null,
}

describe('toSurplusTokenCosts()', () => {
  it('keeps an amount already in the surplus token as is', () => {
    expect(toSurplusTokenCosts([item(USDC, 1234n)], SELL_WETH_FOR_USDC)).toEqual({
      items: [{ amount: 1234n, isApproximate: false }],
      total: 1234n,
      isApproximate: false,
    })
  })

  it('converts the sell token of a sell order at the execution price', () => {
    const result = toSurplusTokenCosts([item(WETH, 10n ** 15n)], SELL_WETH_FOR_USDC)

    expect(result?.items).toEqual([{ amount: 2_500_000n, isApproximate: false }])
  })

  it('converts the buy token of a buy order at the execution price, rounding down', () => {
    const result = toSurplusTokenCosts([item(WETH, 10n ** 15n), item(WETH, 1n)], BUY_WETH_WITH_USDC)

    expect(result?.items).toEqual([
      { amount: 2_500_000n, isApproximate: false },
      { amount: 0n, isApproximate: false },
    ])
  })

  it('converts native 1:1 when the surplus token is the wrapped native token, without a price', () => {
    const result = toSurplusTokenCosts([item(NATIVE, 10n ** 15n)], SELL_USDC_FOR_WETH)

    expect(result).toEqual({
      items: [{ amount: 10n ** 15n, isApproximate: false }],
      total: 10n ** 15n,
      isApproximate: false,
    })
  })

  it('converts native at the native price as an approximation, rounding half up', () => {
    const result = toSurplusTokenCosts(
      [item(NATIVE, 10n ** 15n), item(NATIVE, 6n * 10n ** 8n), item(NATIVE, 5n * 10n ** 8n)],
      SELL_WETH_FOR_USDC,
    )

    expect(result?.items).toEqual([
      { amount: 2_500_000n, isApproximate: true },
      { amount: 2n, isApproximate: true },
      { amount: 1n, isApproximate: true },
    ])
  })

  it.each([null, 0, -1, NaN, Infinity])('is not convertible with a native price of %s', (price) => {
    expect(toSurplusTokenCosts([item(NATIVE, 1n)], { ...SELL_WETH_FOR_USDC, surplusNativePrice: price })).toBeNull()
  })

  it('is not convertible with an unknown token', () => {
    expect(toSurplusTokenCosts([item(USDC, 1n), item(UNKNOWN, 1n)], SELL_WETH_FOR_USDC)).toBeNull()
  })

  it('is not convertible when the execution divisor is zero', () => {
    expect(toSurplusTokenCosts([item(WETH, 1n)], { ...SELL_WETH_FOR_USDC, executedSellAmount: 0n })).toBeNull()
  })

  it('sums the items and propagates the approximation', () => {
    const result = toSurplusTokenCosts([item(NATIVE, 10n ** 15n), item(USDC, 500_000n)], SELL_WETH_FOR_USDC)

    expect(result).toEqual({
      items: [
        { amount: 2_500_000n, isApproximate: true },
        { amount: 500_000n, isApproximate: false },
      ],
      total: 3_000_000n,
      isApproximate: true,
    })
  })
})
