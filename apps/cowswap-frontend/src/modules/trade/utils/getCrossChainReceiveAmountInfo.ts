import { FractionUtils, isSellOrder } from '@cowprotocol/common-utils'
import { getQuoteAmountsAndCosts } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Price } from '@uniswap/sdk-core'

import { BridgeFeeAmounts, CrossChainReceiveAmountInfoParams } from './types'

import { ReceiveAmountInfo } from '../types'

// eslint-disable-next-line max-lines-per-function, complexity
export function getCrossChainReceiveAmountInfo(params: CrossChainReceiveAmountInfoParams): ReceiveAmountInfo {
  const {
    orderParams,
    inputCurrency,
    outputCurrency,
    slippagePercent,
    partnerFeeBps = 0,
    protocolFeeBps,
    intermediateCurrency,
    bridgeFeeAmounts,
    bridgeBuyAmount,
  } = params
  const currenciesExcludingIntermediate = { inputCurrency, outputCurrency }

  const isSell = isSellOrder(orderParams.kind)

  const buyToken = intermediateCurrency && bridgeBuyAmount ? intermediateCurrency : outputCurrency

  const result = getQuoteAmountsAndCosts({
    orderParams:
      intermediateCurrency && bridgeBuyAmount
        ? {
            ...orderParams,
            buyAmount: FractionUtils.adjustDecimalsAtoms(
              CurrencyAmount.fromRawAmount(intermediateCurrency, bridgeBuyAmount.toString()),
              outputCurrency.decimals,
              intermediateCurrency.decimals,
            ).quotient.toString(),
          }
        : orderParams,
    sellDecimals: inputCurrency.decimals,
    buyDecimals: buyToken.decimals,
    slippagePercentBps: Number(slippagePercent.numerator),
    partnerFeeBps,
    protocolFeeBps,
  })

  const currenciesWithIntermediate = {
    inputCurrency,
    outputCurrency: intermediateCurrency ?? outputCurrency,
  }
  const beforeNetworkCosts = mapBigIntAmounts(result.beforeNetworkCosts, currenciesWithIntermediate)
  const afterNetworkCosts = mapBigIntAmounts(result.afterNetworkCosts, currenciesWithIntermediate)

  const bridgeFee = calculateBridgeFee(outputCurrency, intermediateCurrency, bridgeFeeAmounts)

  return {
    ...result,
    quotePrice: new Price<Currency, Currency>({
      baseAmount: beforeNetworkCosts.sellAmount,
      quoteAmount: afterNetworkCosts.buyAmount,
    }),
    costs: {
      networkFee: {
        amountInSellCurrency: CurrencyAmount.fromRawAmount(
          currenciesWithIntermediate.inputCurrency,
          result.costs.networkFee.amountInSellCurrency.toString(),
        ),
        amountInBuyCurrency: CurrencyAmount.fromRawAmount(
          currenciesWithIntermediate.outputCurrency,
          result.costs.networkFee.amountInBuyCurrency.toString(),
        ),
      },
      partnerFee: {
        amount: CurrencyAmount.fromRawAmount(
          isSell ? currenciesWithIntermediate.outputCurrency : inputCurrency,
          result.costs.partnerFee.amount.toString(),
        ),
        bps: result.costs.partnerFee.bps,
      },
      protocolFee:
        result.costs.protocolFee && result.costs.protocolFee.amount !== 0n
          ? {
              amount: CurrencyAmount.fromRawAmount(
                isSell ? currenciesWithIntermediate.outputCurrency : inputCurrency,
                result.costs.protocolFee.amount.toString(),
              ),
              bps: result.costs.protocolFee.bps,
            }
          : undefined,
      bridgeFee,
    },
    beforeAllFees: {
      sellAmount: CurrencyAmount.fromRawAmount(
        currenciesWithIntermediate.inputCurrency,
        result.beforeAllFees.sellAmount.toString(),
      ),
      buyAmount: CurrencyAmount.fromRawAmount(
        currenciesWithIntermediate.outputCurrency,
        result.beforeAllFees.buyAmount.toString(),
      ),
    },
    beforeNetworkCosts,
    afterNetworkCosts,
    afterPartnerFees: mapBigIntAmounts(result.afterPartnerFees, currenciesWithIntermediate),
    afterSlippage: mapBigIntAmounts(result.afterSlippage, currenciesExcludingIntermediate),
  }
}

function calculateBridgeFee(
  outputCurrency: Currency,
  intermediateCurrency?: Currency,
  bridgeFeeAmounts?: BridgeFeeAmounts,
): ReceiveAmountInfo['costs']['bridgeFee'] | undefined {
  if (!bridgeFeeAmounts || !intermediateCurrency) return undefined

  return {
    amountInIntermediateCurrency: CurrencyAmount.fromRawAmount(
      intermediateCurrency,
      bridgeFeeAmounts.amountInBuyCurrency.toString(),
    ),
    amountInDestinationCurrency: CurrencyAmount.fromRawAmount(
      outputCurrency,
      bridgeFeeAmounts.amountInSellCurrency.toString(),
    ),
  }
}

function mapBigIntAmounts(
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
