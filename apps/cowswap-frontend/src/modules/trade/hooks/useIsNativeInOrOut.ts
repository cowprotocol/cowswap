import { useMemo } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradeState } from './useTradeState'
import { useTradeStateReadiness } from './useTradeStateReadiness'

export function useIsNativeIn(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { isReady } = useTradeStateReadiness()
  const { inputCurrencyId } = state || {}

  return useMemo(() => {
    if (!isReady) return false
    
    return Boolean(inputCurrencyId && getIsNativeToken(chainId, inputCurrencyId))
  }, [isReady, chainId, inputCurrencyId])
}

export function useIsNativeOut(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { isReady } = useTradeStateReadiness()
  const { outputCurrencyId } = state || {}

  return useMemo(() => {
    if (!isReady) return false
    
    return Boolean(outputCurrencyId && getIsNativeToken(chainId, outputCurrencyId))
  }, [isReady, chainId, outputCurrencyId])
}
