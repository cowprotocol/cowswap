import { isSellOrder } from '@cowprotocol/common-utils'
import { getQuoteAmountsAndCosts } from '@cowprotocol/cow-sdk'
import { QuoteAmountsAndCosts } from '@cowprotocol/sdk-order-book'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { ReceiveAmountInfoParams } from './types'

import { ReceiveAmountInfo } from '../types'

interface Currencies {
  inputCurrency: Currency
  outputCurrency: Currency
}

/**
 * This function only does convert `bigint` values from `getQuoteAmountsAndCosts` into `CurrencyAmount<Currency>`
 */
export function getReceiveAmountInfo(
  params: ReceiveAmountInfoParams,
  buyAmountOverride?: CurrencyAmount<Currency>,
): ReceiveAmountInfo {
  const { orderParams, inputCurrency, outputCurrency, slippagePercent, partnerFeeBps = 0, protocolFeeBps } = params
  const currencies = { inputCurrency, outputCurrency: buyAmountOverride?.currency ?? outputCurrency }
  const isSell = isSellOrder(orderParams.kind)

  const result = getQuoteAmountsAndCosts({
    orderParams: {
      ...orderParams,
      buyAmount: buyAmountOverride ? buyAmountOverride.quotient.toString() : orderParams.buyAmount,
    },
    sellDecimals: inputCurrency.decimals,
    buyDecimals: outputCurrency.decimals,
    slippagePercentBps: Number(slippagePercent.numerator),
    partnerFeeBps,
    protocolFeeBps,
  })

  const beforeNetworkCosts = mapSellBuyAmounts(result.beforeNetworkCosts, currencies)
  const afterNetworkCosts = mapSellBuyAmounts(result.afterNetworkCosts, currencies)

  return {
    isSell,
    quotePrice: new Price<Currency, Currency>({
      baseAmount: beforeNetworkCosts.sellAmount,
      quoteAmount: afterNetworkCosts.buyAmount,
    }),
    costs: {
      networkFee: calculateNetworkFee(result.costs.networkFee, currencies),
      partnerFee: mapFeeAmounts(isSell, result.costs.partnerFee, currencies),
      protocolFee: !!result.costs.protocolFee ? mapFeeAmounts(isSell, result.costs.protocolFee, currencies) : undefined,
    },
    beforeAllFees: mapSellBuyAmounts(result.beforeAllFees, currencies),
    beforeNetworkCosts,
    afterNetworkCosts,
    afterPartnerFees: mapSellBuyAmounts(result.afterPartnerFees, currencies),
    afterSlippage: mapSellBuyAmounts(result.afterSlippage, currencies),
  }
}

function calculateNetworkFee(
  networkFee: QuoteAmountsAndCosts['costs']['networkFee'],
  currencies: Currencies,
): ReceiveAmountInfo['costs']['networkFee'] {
  return {
    amountInSellCurrency: CurrencyAmount.fromRawAmount(
      currencies.inputCurrency,
      networkFee.amountInSellCurrency.toString(),
    ),
    amountInBuyCurrency: CurrencyAmount.fromRawAmount(
      currencies.outputCurrency,
      networkFee.amountInBuyCurrency.toString(),
    ),
  }
}

function mapSellBuyAmounts(
  amounts: { sellAmount: bigint; buyAmount: bigint },
  currencies: Currencies,
): {
  sellAmount: CurrencyAmount<Currency>
  buyAmount: CurrencyAmount<Currency>
} {
  return {
    sellAmount: CurrencyAmount.fromRawAmount(currencies.inputCurrency, amounts.sellAmount.toString()),
    buyAmount: CurrencyAmount.fromRawAmount(currencies.outputCurrency, amounts.buyAmount.toString()),
  }
}

function mapFeeAmounts(
  isSell: boolean,
  data: {
    amount: bigint
    bps: number
  },
  currencies: Currencies,
): {
  amount: CurrencyAmount<Currency>
  bps: number
} {
  return {
    amount: CurrencyAmount.fromRawAmount(
      isSell ? currencies.outputCurrency : currencies.inputCurrency,
      data.amount.toString(),
    ),
    bps: data.bps,
  }
}
