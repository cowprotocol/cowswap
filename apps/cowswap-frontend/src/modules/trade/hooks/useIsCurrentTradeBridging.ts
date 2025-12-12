import { useDerivedTradeState } from './useDerivedTradeState'

export function useIsCurrentTradeBridging(): boolean {
  const derivedTradeState = useDerivedTradeState()

  return Boolean(
    derivedTradeState?.inputCurrency &&
      derivedTradeState?.outputCurrency &&
      derivedTradeState.inputCurrency.chainId !== derivedTradeState.outputCurrency.chainId,
  )
}
