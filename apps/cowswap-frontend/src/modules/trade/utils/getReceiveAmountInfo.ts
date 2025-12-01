import { isSellOrder } from '@cowprotocol/common-utils'
import { getQuoteAmountsAndCosts, type OrderParameters } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Percent, Price } from '@uniswap/sdk-core'

import { ReceiveAmountInfo } from '../types'

/**
 * This function only does convert `bigint` values from `getQuoteAmountsAndCosts` into `CurrencyAmount<Currency>`
 */
export function getReceiveAmountInfo(
  orderParams: OrderParameters,
  inputCurrency: Currency,
  outputCurrency: Currency,
  slippagePercent: Percent,
  _partnerFeeBps: number | undefined,
  protocolFeeBps?: number,
): ReceiveAmountInfo {
  const partnerFeeBps = _partnerFeeBps ?? 0
  const currencies = { inputCurrency, outputCurrency }
  const isSell = isSellOrder(orderParams.kind)

  const result = getQuoteAmountsAndCosts({
    orderParams,
    sellDecimals: inputCurrency.decimals,
    buyDecimals: outputCurrency.decimals,
    slippagePercentBps: Number(slippagePercent.numerator),
    partnerFeeBps,
    protocolFeeBps,
  })

  const beforeNetworkCosts = mapSellBuyAmounts(result.beforeNetworkCosts, currencies)
  const afterNetworkCosts = mapSellBuyAmounts(result.afterNetworkCosts, currencies)

  const bridgeFee = undefined

  return {
    ...result,
    quotePrice: new Price<Currency, Currency>({
      baseAmount: beforeNetworkCosts.sellAmount,
      quoteAmount: afterNetworkCosts.buyAmount,
    }),
    costs: {
      networkFee: {
        amountInSellCurrency: CurrencyAmount.fromRawAmount(
          inputCurrency,
          result.costs.networkFee.amountInSellCurrency.toString(),
        ),
        amountInBuyCurrency: CurrencyAmount.fromRawAmount(
          outputCurrency,
          result.costs.networkFee.amountInBuyCurrency.toString(),
        ),
      },
      partnerFee: mapFeeAmounts(isSell, result.costs.partnerFee, currencies),
      protocolFee: !!result.costs.protocolFee ? mapFeeAmounts(isSell, result.costs.protocolFee, currencies) : undefined,
      bridgeFee,
    },
    beforeAllFees: mapSellBuyAmounts(result.beforeAllFees, currencies),
    beforeNetworkCosts,
    afterNetworkCosts,
    afterPartnerFees: mapSellBuyAmounts(result.afterPartnerFees, currencies),
    afterSlippage: mapSellBuyAmounts(result.afterSlippage, currencies),
  }
}

function mapSellBuyAmounts(
  amounts: { sellAmount: bigint; buyAmount: bigint },
  currencies: { inputCurrency: Currency; outputCurrency: Currency },
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
  currencies: { inputCurrency: Currency; outputCurrency: Currency },
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
