import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { getReceiveAmountInfo } from './getReceiveAmountInfo'
import { BridgeFeeAmounts, CrossChainReceiveAmountInfoParams } from './types'

import { ReceiveAmountInfo } from '../types'

export function getCrossChainReceiveAmountInfo(params: CrossChainReceiveAmountInfoParams): ReceiveAmountInfo {
  const { outputCurrency, intermediateCurrency, bridgeFeeAmounts, bridgeBuyAmount } = params

  const bridgeOutputAmount = CurrencyAmount.fromRawAmount(outputCurrency, bridgeBuyAmount.toString())

  const data = getReceiveAmountInfo(params, bridgeOutputAmount)
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
