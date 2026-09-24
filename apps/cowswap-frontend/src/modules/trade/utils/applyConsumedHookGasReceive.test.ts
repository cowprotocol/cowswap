import { OrderKind, type OrderParameters } from '@cowprotocol/cow-sdk'
import { CurrencyAmount, Percent, Token } from '@cowprotocol/currency'

import { POLL_FUNDS_HOOK_GAS_LIMIT } from 'entities/twap/composable-cow-poller.constants'

import type { CowHook } from 'modules/appData'
import { applyUnpricedHookGasToOrderParams } from 'modules/tradeQuote'

import { getCrossChainReceiveAmountInfo } from './getCrossChainReceiveAmountInfo'
import { getReceiveAmountInfo } from './getReceiveAmountInfo'

import type { ReceiveAmountInfo } from '../types'

const QUOTE_HOOK: CowHook = {
  target: '0x0000000000000000000000000000000000000000',
  callData: '0x',
  gasLimit: POLL_FUNDS_HOOK_GAS_LIMIT,
}

const INPUT_CURRENCY = new Token(1, '0x0000000000000000000000000000000000000001', 6, 'USDC', 'USD Coin')
const OUTPUT_CURRENCY = new Token(1, '0x0000000000000000000000000000000000000002', 18, 'WETH', 'Wrapped Ether')

const QUOTED_ORDER_PARAMS = {
  kind: OrderKind.SELL,
  sellAmount: '1',
  buyAmount: '2',
  feeAmount: '1000',
  gasAmount: '241700',
  gasPrice: '3',
  sellTokenPrice: '2',
} as OrderParameters

describe('applyConsumedHookGasReceive', () => {
  it('keeps before-costs and shows a 0 receive when hook gas consumes the part', () => {
    const adjusted = applyUnpricedHookGasToOrderParams(QUOTED_ORDER_PARAMS, [QUOTE_HOOK])
    const original = buildReceiveAmountInfo(QUOTED_ORDER_PARAMS)
    const result = buildReceiveAmountInfo(adjusted, QUOTED_ORDER_PARAMS)

    expect(BigInt(adjusted.sellAmount) < 0n).toBe(true)
    expect(BigInt(adjusted.buyAmount) < 0n).toBe(true)
    expect(result.beforeNetworkCosts.sellAmount.quotient).toBe(1001n)
    expect(result.beforeNetworkCosts.buyAmount.quotient).toBe(2002n)
    expect(result.beforeNetworkCosts.sellAmount.quotient).toBe(original.beforeNetworkCosts.sellAmount.quotient)
    expect(result.beforeNetworkCosts.buyAmount.quotient).toBe(original.beforeNetworkCosts.buyAmount.quotient)
    expect(result.beforeAllFees.buyAmount.quotient).toBe(original.beforeAllFees.buyAmount.quotient)
    expect(result.afterNetworkCosts.buyAmount.quotient).toBe(0n)
    expect(result.afterPartnerFees.buyAmount.quotient).toBe(0n)
    expect(result.afterSlippage.buyAmount.quotient).toBe(0n)
    expect(result.amountsToSign.buyAmount.quotient).toBe(0n)
    expect(result.amountsToSign.sellAmount.quotient).toBe(original.amountsToSign.sellAmount.quotient)
    expect(result.costs.networkFee.amountInBuyCurrency.quotient).toBe(original.beforeNetworkCosts.buyAmount.quotient)
    expect(result.costs.networkFee.amountInSellCurrency.quotient).toBe(original.beforeNetworkCosts.sellAmount.quotient)
    expect(result.quotePrice.equalTo(original.quotePrice)).toBe(true)
    expect(result.quotePrice.quote(result.beforeNetworkCosts.sellAmount).quotient).toBe(2n)
  })

  it('keeps the 0 receive after a cross-chain bridge fee is added', () => {
    const adjusted = applyUnpricedHookGasToOrderParams(QUOTED_ORDER_PARAMS, [QUOTE_HOOK])
    const result = getCrossChainReceiveAmountInfo({
      orderParams: adjusted,
      quotedOrderParams: QUOTED_ORDER_PARAMS,
      inputCurrency: INPUT_CURRENCY,
      outputCurrency: OUTPUT_CURRENCY,
      slippagePercent: new Percent(0, 10_000),
      partnerFeeBps: 0,
      protocolFeeBps: 0,
      intermediateCurrency: INPUT_CURRENCY,
      bridgeFeeAmounts: {
        amountInSellCurrency: 1n,
        amountInBuyCurrency: 1n,
      },
      expectedToReceiveAmount: CurrencyAmount.fromRawAmount(OUTPUT_CURRENCY, 5n),
    })

    expect(result.afterSlippage.buyAmount.quotient).toBe(0n)
    expect(result.amountsToSign.buyAmount.quotient).toBe(0n)
    expect(result.costs.bridgeFee?.amountInDestinationCurrency.quotient).toBe(1n)
  })
})

function buildReceiveAmountInfo(orderParams: OrderParameters, quotedOrderParams?: OrderParameters): ReceiveAmountInfo {
  return getReceiveAmountInfo({
    orderParams,
    quotedOrderParams,
    inputCurrency: INPUT_CURRENCY,
    outputCurrency: OUTPUT_CURRENCY,
    slippagePercent: new Percent(0, 10_000),
    partnerFeeBps: 0,
    protocolFeeBps: 0,
  })
}
