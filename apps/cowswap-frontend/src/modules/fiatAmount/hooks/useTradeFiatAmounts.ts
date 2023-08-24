import { useIsWrapOrUnwrap } from 'modules/trade/hooks/useIsWrapOrUnwrap'

import { TradeAmounts } from 'common/types'
import { isFractionFalsy } from 'utils/isFractionFalsy'

import { FiatAmountInfo, useFiatAmount } from './useFiatAmount'

export interface TradeUSDAmounts {
  inputAmount: FiatAmountInfo
  outputAmount: FiatAmountInfo
}

export function useTradeFiatAmounts({ inputAmount, outputAmount }: Partial<TradeAmounts>): TradeUSDAmounts {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const isTradeReady = !isWrapOrUnwrap && !isFractionFalsy(inputAmount) && !isFractionFalsy(outputAmount)

  return {
    inputAmount: useFiatAmount(isTradeReady ? inputAmount : null),
    outputAmount: useFiatAmount(isTradeReady ? outputAmount : null),
  }
}
