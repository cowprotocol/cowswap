import { TradeFormValidation, useGetTradeFormValidation } from 'modules/tradeFormValidation'

import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'

const NO_UPDATE_STATES = [
  TradeFormValidation.CurrencyNotSupported,
  TradeFormValidation.CurrencyNotSet,
  TradeFormValidation.InputAmountNotSet,
]

export function useIsQuoteUpdatePossible(): boolean {
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const validation = useGetTradeFormValidation()

  /**
   * We have to check that instead of TradeFormValidation.WrapUnwrapFlow
   * Because if it's WrapOrUnwrap and there is not enough balance, then validation will be BalanceInsufficient
   */
  if (isWrapOrUnwrap) return false

  return validation ? !NO_UPDATE_STATES.includes(validation) : true
}
