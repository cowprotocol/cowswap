import { isSellOrder } from '@cowprotocol/common-utils'
import { getQuoteAmountsAndCosts, type OrderParameters } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Price } from '@cowprotocol/currency'
import { QuoteAmountsAndCosts } from '@cowprotocol/sdk-order-book'
import { getSolanaQuoteAmountsAndCosts } from '@cowprotocol/sdk-trading-solana'

import { applyConsumedHookGasReceive, hookGasConsumesQuotedPart } from './applyConsumedHookGasReceive'
import { positiveIntegerAtom } from './positiveIntegerAtom'
import { splitSolanaAccountRent } from './splitSolanaAccountRent'
import { ReceiveAmountInfoParams } from './types'

import { ReceiveAmountInfo } from '../types'

interface Currencies {
  inputCurrency: Currency
  outputCurrency: Currency
}

/**
 * Converts `bigint` values from `getQuoteAmountsAndCosts` into `CurrencyAmount<Currency>`.
 * When hook gas consumes the part, amounts are priced from the original quote and the receive is zeroed.
 */
export function getReceiveAmountInfo(
  params: ReceiveAmountInfoParams,
  buyAmountOverride?: CurrencyAmount<Currency>,
): ReceiveAmountInfo {
  const { inputCurrency, outputCurrency, solanaQuoteResponse } = params
  const consumedByHookGas = hookGasConsumesQuotedPart(params.orderParams, params.quotedOrderParams)
  const orderParams = consumedByHookGas && params.quotedOrderParams ? params.quotedOrderParams : params.orderParams
  const currencies = { inputCurrency, outputCurrency: buyAmountOverride?.currency ?? outputCurrency }
  const isSell = isSellOrder(orderParams.kind)

  const result = getAmountsAndCosts(params, {
    ...orderParams,
    buyAmount: buyAmountOverride ? buyAmountOverride.quotient.toString() : orderParams.buyAmount,
  })

  const beforeNetworkCosts = mapSellBuyAmounts(result.beforeNetworkCosts, currencies)
  const afterNetworkCosts = mapSellBuyAmounts(result.afterNetworkCosts, currencies)

  const info: ReceiveAmountInfo = {
    isSell,
    quotePrice: getQuotePrice(beforeNetworkCosts, afterNetworkCosts),
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
    amountsToSign: mapSellBuyAmounts(result.amountsToSign, currencies),
  }

  if (consumedByHookGas) {
    const networkFeeInSellAtoms = positiveIntegerAtom(params.orderParams.feeAmount)

    return applyConsumedHookGasReceive(info, networkFeeInSellAtoms ?? beforeNetworkCosts.sellAmount.quotient)
  }

  return splitSolanaAccountRent(info, solanaQuoteResponse?.quote.costs)
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

function getAmountsAndCosts(params: ReceiveAmountInfoParams, orderParams: OrderParameters): QuoteAmountsAndCosts {
  const { slippagePercent, partnerFeeBps = 0, protocolFeeBps, solanaQuoteResponse } = params
  const slippagePercentBps = Number(slippagePercent.numerator)

  if (solanaQuoteResponse) {
    return getSolanaQuoteAmountsAndCosts({
      quoteResponse: { ...solanaQuoteResponse, quote: { ...solanaQuoteResponse.quote, ...orderParams } },
      slippagePercentBps,
      partnerFeeBps,
    })
  }

  return getQuoteAmountsAndCosts({ orderParams, slippagePercentBps, partnerFeeBps, protocolFeeBps })
}

function getQuotePrice(
  beforeNetworkCosts: ReceiveAmountInfo['beforeNetworkCosts'],
  afterNetworkCosts: ReceiveAmountInfo['afterNetworkCosts'],
): Price<Currency, Currency> {
  // A malformed Solana buy quote whose costs exceed its sell amount floors this at zero
  const baseAmount = beforeNetworkCosts.sellAmount.greaterThan(0)
    ? beforeNetworkCosts.sellAmount
    : afterNetworkCosts.sellAmount

  return new Price<Currency, Currency>({ baseAmount, quoteAmount: afterNetworkCosts.buyAmount })
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
