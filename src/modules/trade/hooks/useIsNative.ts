import { Nullish } from 'types'

import { useTokenBySymbolOrAddress } from 'common/hooks/useTokenBySymbolOrAddress'

import { useTradeState } from './useTradeState'

export function useIsNativeIn(): boolean {
  const { state } = useTradeState()
  const { inputCurrencyId } = state || {}

  return _useIsNative(inputCurrencyId)
}

export function useIsNativeOut(): boolean {
  const { state } = useTradeState()
  const { outputCurrencyId } = state || {}

  return _useIsNative(outputCurrencyId)
}

function _useIsNative(currencyId: Nullish<string>): boolean {
  const token = useTokenBySymbolOrAddress(currencyId)

  return !!token?.isNative
}
