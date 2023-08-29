import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'

import { TradeAmounts } from 'common/types'
import { isFractionFalsy } from 'utils/isFractionFalsy'

import { UsdAmountInfo, useUsdAmount } from './useUsdAmount'

export interface TradeUSDAmounts {
  inputAmount: UsdAmountInfo
  outputAmount: UsdAmountInfo
}

export function useTradeUsdAmounts({ inputAmount, outputAmount }: Partial<TradeAmounts>): TradeUSDAmounts {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isTradeReady = !isWrapOrUnwrap && !isFractionFalsy(inputAmount) && !isFractionFalsy(outputAmount)

  return {
    inputAmount: useUsdAmount(isTradeReady ? inputAmount : null),
    outputAmount: useUsdAmount(isTradeReady ? outputAmount : null),
  }
}
