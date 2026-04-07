import { TradeFormValidation, useGetTradeFormValidations } from 'modules/tradeFormValidation'

const NO_UPDATE_STATES = [
  TradeFormValidation.CurrencyNotSupported,
  TradeFormValidation.NetworkNotSupported,
  TradeFormValidation.NetworkDeprecated,
  TradeFormValidation.BrowserOffline,
  TradeFormValidation.CurrencyNotSet,
  TradeFormValidation.InputAmountNotSet,
  TradeFormValidation.WrapUnwrapFlow,
]

export function useIsQuoteUpdatePossible(): boolean {
  const validations = useGetTradeFormValidations()

  return validations ? !NO_UPDATE_STATES.some((state) => validations.includes(state)) : true
}
