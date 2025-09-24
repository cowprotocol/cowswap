import { useMemo } from 'react'

import type { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useQuoteBridgeContext } from 'modules/bridge'
import { useGetReceiveAmountInfo } from 'modules/trade'

import type { CurrencyPreviewInfo } from 'common/pure/CurrencyAmountPreview'

export type ConfirmEventAmountsParams = {
  shouldDisplayBridgeDetails: boolean
  bridgeContext: ReturnType<typeof useQuoteBridgeContext>
  inputCurrencyAmount: CurrencyPreviewInfo['amount']
  outputCurrencyAmount: CurrencyPreviewInfo['amount']
  receiveAmountInfo: ReturnType<typeof useGetReceiveAmountInfo>
}

export function useConfirmEventAmounts(params: ConfirmEventAmountsParams): {
  inputAmount: CurrencyAmount<Currency> | null
  outputAmount: CurrencyAmount<Currency> | null
} {
  const {
    shouldDisplayBridgeDetails,
    bridgeContext,
    inputCurrencyAmount,
    outputCurrencyAmount,
    receiveAmountInfo,
  } = params

  return useMemo(
    () =>
      shouldDisplayBridgeDetails
        ? getBridgeAmounts({ bridgeContext, inputCurrencyAmount, outputCurrencyAmount })
        : getSlippageAdjustedAmounts({ receiveAmountInfo, inputCurrencyAmount, outputCurrencyAmount }),
    [
      shouldDisplayBridgeDetails,
      bridgeContext,
      inputCurrencyAmount,
      outputCurrencyAmount,
      receiveAmountInfo,
    ],
  )
}

function getBridgeAmounts({
  bridgeContext,
  inputCurrencyAmount,
  outputCurrencyAmount,
}: Pick<ConfirmEventAmountsParams, 'bridgeContext' | 'inputCurrencyAmount' | 'outputCurrencyAmount'>): {
  inputAmount: CurrencyAmount<Currency> | null
  outputAmount: CurrencyAmount<Currency> | null
} {
  const inputAmount = inputCurrencyAmount ?? bridgeContext?.sellAmount ?? null
  const outputAmount = bridgeContext?.buyAmount ?? outputCurrencyAmount ?? null
  return { inputAmount, outputAmount }
}

function getSlippageAdjustedAmounts({
  receiveAmountInfo,
  inputCurrencyAmount,
  outputCurrencyAmount,
}: Pick<ConfirmEventAmountsParams, 'receiveAmountInfo' | 'inputCurrencyAmount' | 'outputCurrencyAmount'>): {
  inputAmount: CurrencyAmount<Currency> | null
  outputAmount: CurrencyAmount<Currency> | null
} {
  const slippageAmounts = receiveAmountInfo?.afterSlippage
  const inputAmount = slippageAmounts?.sellAmount ?? inputCurrencyAmount ?? null
  const outputAmount = slippageAmounts?.buyAmount ?? outputCurrencyAmount ?? null
  return { inputAmount, outputAmount }
}
