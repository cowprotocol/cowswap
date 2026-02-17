import { useAtomValue } from 'jotai'
import { useMemo } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Percent } from '@uniswap/sdk-core'

import { useGetReceiveAmountInfo } from '../../trade'
import { fullAmountQuoteAtom } from '../state/fullAmountQuoteAtom'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export interface SwapAmountDifference {
  amount: CurrencyAmount<Currency>
  percent: Percent
}

export function useSwapAmountDifference(): SwapAmountDifference | null {
  const fullAmountQuote = useAtomValue(fullAmountQuoteAtom)
  const outputPartAmount = useGetReceiveAmountInfo()?.amountsToSign.buyAmount
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)

  return useMemo(() => {
    if (!outputPartAmount || isFractionFalsy(outputPartAmount)) return null

    const fullQuoteBuyAmountStr = fullAmountQuote?.quote.buyAmount

    if (!fullQuoteBuyAmountStr || !numberOfPartsValue) return null

    const fullQuoteBuyAmount = CurrencyAmount.fromRawAmount(outputPartAmount.currency, fullQuoteBuyAmountStr)
    const allPartsAmount = outputPartAmount.multiply(numberOfPartsValue)

    const differenceAmount = allPartsAmount.subtract(fullQuoteBuyAmount)

    return {
      amount: differenceAmount,
      percent: new Percent(differenceAmount.quotient, allPartsAmount.quotient),
    }
  }, [fullAmountQuote, outputPartAmount, numberOfPartsValue])
}
