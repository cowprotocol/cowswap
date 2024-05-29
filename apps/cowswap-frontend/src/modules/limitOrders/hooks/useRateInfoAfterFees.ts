import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { getDirectedReceiveAmounts, ReceiveAmountInfo } from 'modules/trade'

import { useRateInfoParams } from 'common/hooks/useRateInfoParams'
import type { RateInfoParams } from 'common/pure/RateInfo'

export function useRateInfoAfterFees(
  receiveAmountInfo: ReceiveAmountInfo | null,
  inputAmount: CurrencyAmount<Currency> | null,
  outputAmount: CurrencyAmount<Currency> | null
): RateInfoParams {
  const amountAfterFees = (receiveAmountInfo && getDirectedReceiveAmounts(receiveAmountInfo)?.amountAfterFees) || null

  return useRateInfoParams(
    preferAmountAfterFees(amountAfterFees, inputAmount),
    preferAmountAfterFees(amountAfterFees, outputAmount)
  )
}

const preferAmountAfterFees = (
  amountAfterFees: Nullish<CurrencyAmount<Currency>>,
  amount: Nullish<CurrencyAmount<Currency>>
) => (amountAfterFees?.currency === amount?.currency ? amountAfterFees : amount)
