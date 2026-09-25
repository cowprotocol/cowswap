import { getQuoteAmountsAndCosts, OrderKind, type OrderParameters } from '@cowprotocol/cow-sdk'

import { POLL_FUNDS_HOOK_GAS_LIMIT } from 'entities/twap/composable-cow-poller.constants'

import type { CowHook } from 'modules/appData'

import { applyUnpricedHookGasToOrderParams } from './applyUnpricedHookGasToOrderParams'

const POLL_FUNDS_GAS = BigInt(POLL_FUNDS_HOOK_GAS_LIMIT)

const QUOTE_HOOK: CowHook = {
  target: '0x0000000000000000000000000000000000000000',
  callData: '0x',
  gasLimit: POLL_FUNDS_HOOK_GAS_LIMIT,
}

const ORDER_PARAMS = {
  kind: OrderKind.SELL,
  sellAmount: '1000000',
  buyAmount: '2000000',
  feeAmount: '1000',
  gasAmount: '241700',
  gasPrice: '3',
  sellTokenPrice: '2',
} as OrderParameters

describe('applyUnpricedHookGasToOrderParams', () => {
  it('returns the same quote when there is no extra hook gas', () => {
    expect(applyUnpricedHookGasToOrderParams(ORDER_PARAMS, undefined)).toBe(ORDER_PARAMS)
    expect(applyUnpricedHookGasToOrderParams(ORDER_PARAMS, [])).toBe(ORDER_PARAMS)
  })

  it('adds ceil(hookGas * gasPrice / sellTokenPrice) to the fee and takes it out of the swapped amounts', () => {
    const result = applyUnpricedHookGasToOrderParams(ORDER_PARAMS, [QUOTE_HOOK])
    const extraFee = (POLL_FUNDS_GAS * 3n + 1n) / 2n

    expect(extraFee).toBe(525_000n)
    expect(result.feeAmount).toBe((1000n + extraFee).toString())
    expect(result.sellAmount).toBe((1_000_000n - extraFee).toString())
    expect(result.buyAmount).toBe((2_000_000n - (2_000_000n * extraFee) / 1_000_000n).toString())
    expect(result.gasAmount).toBe((241700n + POLL_FUNDS_GAS).toString())
  })

  it('keeps the sell amount the user entered and lowers the after-fee buy amount', () => {
    const adjusted = applyUnpricedHookGasToOrderParams(ORDER_PARAMS, [QUOTE_HOOK])
    const before = getQuoteAmountsAndCosts({
      orderParams: ORDER_PARAMS,
      slippagePercentBps: 0,
      partnerFeeBps: 0,
      protocolFeeBps: 0,
    })
    const after = getQuoteAmountsAndCosts({
      orderParams: adjusted,
      slippagePercentBps: 0,
      partnerFeeBps: 0,
      protocolFeeBps: 0,
    })

    expect(after.beforeAllFees.sellAmount).toBe(before.beforeAllFees.sellAmount)
    expect(after.costs.networkFee.amountInSellCurrency > before.costs.networkFee.amountInSellCurrency).toBe(true)
    expect(after.afterNetworkCosts.buyAmount < before.afterNetworkCosts.buyAmount).toBe(true)
  })

  it('subtracts hook gas even when the extra fee consumes the sell and buy amounts', () => {
    const tinySell = { ...ORDER_PARAMS, sellAmount: '1', buyAmount: '1' }
    const result = applyUnpricedHookGasToOrderParams(tinySell, [QUOTE_HOOK])
    const extraFee = (POLL_FUNDS_GAS * 3n + 1n) / 2n
    const extraFeeBuy = (1n * extraFee) / 1n

    expect(extraFee > 1n).toBe(true)
    expect(result.sellAmount).toBe((1n - extraFee).toString())
    expect(result.buyAmount).toBe((1n - extraFeeBuy).toString())
    expect(BigInt(result.sellAmount) < 0n).toBe(true)
    expect(BigInt(result.buyAmount) < 0n).toBe(true)
    expect(BigInt(result.sellAmount) + BigInt(result.feeAmount)).toBe(1n + BigInt(tinySell.feeAmount))
    expect(result.gasAmount).toBe((241700n + POLL_FUNDS_GAS).toString())
  })

  it('rounds a fractional sellTokenPrice and gasAmount up to integer atoms', () => {
    // Documented /quote shape: sellTokenPrice can be below 1 wei per atom, and gasAmount can be fractional.
    const fractional = {
      ...ORDER_PARAMS,
      sellAmount: '20000000000000000000',
      buyAmount: '40000000000000000000',
      gasAmount: '150000.25',
      gasPrice: '15000000000',
      sellTokenPrice: '0.0004',
    }
    const result = applyUnpricedHookGasToOrderParams(fractional, [QUOTE_HOOK])
    const extraFee = 13_125_000_000_000_000_000n
    const sellAmount = 20_000_000_000_000_000_000n
    const buyAmount = 40_000_000_000_000_000_000n

    expect(result.feeAmount).toBe((1000n + extraFee).toString())
    expect(result.sellAmount).toBe((sellAmount - extraFee).toString())
    expect(result.buyAmount).toBe((buyAmount - (buyAmount * extraFee) / sellAmount).toString())
    expect(result.gasAmount).toBe('500001')

    const fractionalGasPrice = {
      ...ORDER_PARAMS,
      gasAmount: '355981.9',
      gasPrice: '10000000.5',
      sellTokenPrice: '501011728.05327892303466796875',
    }
    const precise = applyUnpricedHookGasToOrderParams(fractionalGasPrice, [QUOTE_HOOK])
    const preciseExtraFee = 6986n

    expect(precise.feeAmount).toBe((1000n + preciseExtraFee).toString())
    expect(precise.sellAmount).toBe((1_000_000n - preciseExtraFee).toString())
    expect(precise.gasAmount).toBe('705982')
  })

  it('leaves the quote unchanged for a nonpositive or invalid price', () => {
    const zero = { ...ORDER_PARAMS, sellTokenPrice: '0.0' }
    const negative = { ...ORDER_PARAMS, gasPrice: '-1.5' }
    const invalid = { ...ORDER_PARAMS, sellTokenPrice: 'not-a-price' }

    expect(applyUnpricedHookGasToOrderParams(zero, [QUOTE_HOOK])).toBe(zero)
    expect(applyUnpricedHookGasToOrderParams(negative, [QUOTE_HOOK])).toBe(negative)
    expect(applyUnpricedHookGasToOrderParams(invalid, [QUOTE_HOOK])).toBe(invalid)
  })
})
