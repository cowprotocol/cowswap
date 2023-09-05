import { useMemo } from 'react'

import { getIsNativeToken } from '@cowswap/common-utils'
import { useWalletInfo } from '@cowswap/wallet'

import { useTradeState } from './useTradeState'

export function useIsNativeIn(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { inputCurrencyId } = state || {}

  return useMemo(
    () => Boolean(chainId && inputCurrencyId && getIsNativeToken(chainId, inputCurrencyId)),
    [chainId, inputCurrencyId]
  )
}

export function useIsNativeOut(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { outputCurrencyId } = state || {}

  return useMemo(
    () => Boolean(chainId && outputCurrencyId && getIsNativeToken(chainId, outputCurrencyId)),
    [chainId, outputCurrencyId]
  )
}
