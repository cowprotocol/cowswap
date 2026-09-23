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

  it('leaves the quote unchanged when the extra fee would consume the sell amount', () => {
    const tinySell = { ...ORDER_PARAMS, sellAmount: '1', buyAmount: '1' }

    expect(applyUnpricedHookGasToOrderParams(tinySell, [QUOTE_HOOK])).toBe(tinySell)
  })
})
