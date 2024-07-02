import { useMemo } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradeState } from './useTradeState'

export function useIsNativeIn(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { inputCurrencyId } = state || {}

  return useMemo(
    () => Boolean(inputCurrencyId && getIsNativeToken(chainId, inputCurrencyId)),
    [chainId, inputCurrencyId]
  )
}

export function useIsNativeOut(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { outputCurrencyId } = state || {}

  return useMemo(
    () => Boolean(outputCurrencyId && getIsNativeToken(chainId, outputCurrencyId)),
    [chainId, outputCurrencyId]
  )
}
