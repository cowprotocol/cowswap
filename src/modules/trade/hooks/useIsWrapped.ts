import { Nullish } from 'types'

import { useTokenBySymbolOrAddress } from 'common/hooks/useTokenBySymbolOrAddress'

import { useTradeState } from './useTradeState'
import { useWrappedToken } from './useWrappedToken'

export function useIsWrappedIn(): boolean {
  const { state } = useTradeState()
  const { inputCurrencyId } = state || {}

  return _useIsWrapped(inputCurrencyId)
}
export function useIsWrappedOut(): boolean {
  const { state } = useTradeState()
  const { outputCurrencyId } = state || {}

  return _useIsWrapped(outputCurrencyId)
}

function _useIsWrapped(currencyId: Nullish<string>): boolean {
  const token = useTokenBySymbolOrAddress(currencyId)
  const wrappedToken = useWrappedToken()

  return !!token?.equals(wrappedToken)
}
