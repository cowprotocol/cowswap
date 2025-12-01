import { FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { getReceiveAmountInfo } from './getReceiveAmountInfo'
import { BridgeFeeAmounts, CrossChainReceiveAmountInfoParams } from './types'

import { ReceiveAmountInfo } from '../types'

/**
 * TODO: I intentionally broke this
 * * afterSlippage: mapBigIntAmounts(result.afterSlippage, currenciesExcludingIntermediate)
 */
export function getCrossChainReceiveAmountInfo(params: CrossChainReceiveAmountInfoParams): ReceiveAmountInfo {
  const { outputCurrency, intermediateCurrency, bridgeFeeAmounts, bridgeBuyAmount } = params

  const intermediateAmount = FractionUtils.adjustDecimalsAtoms(
    CurrencyAmount.fromRawAmount(intermediateCurrency, bridgeBuyAmount.toString()),
    outputCurrency.decimals,
    intermediateCurrency.decimals,
  )

  const data = getReceiveAmountInfo(params, intermediateAmount)
  const bridgeFee = calculateBridgeFee(outputCurrency, intermediateCurrency, bridgeFeeAmounts)

  return {
    ...data,
    costs: {
      ...data.costs,
      bridgeFee,
    },
  }
}

function calculateBridgeFee(
  outputCurrency: Currency,
  intermediateCurrency: Currency,
  bridgeFeeAmounts: BridgeFeeAmounts,
): ReceiveAmountInfo['costs']['bridgeFee'] {
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
