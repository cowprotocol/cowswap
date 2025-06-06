import { useMemo, useRef, useEffect, useState } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradeState } from './useTradeState'

export function useIsNativeIn(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { inputCurrencyId } = state || {}

  // Add stability tracking to prevent flickering
  const [isStable, setIsStable] = useState(false)
  const prevInputCurrencyIdRef = useRef(inputCurrencyId)

  const isNativeIn = useMemo(
    () => Boolean(inputCurrencyId && getIsNativeToken(chainId, inputCurrencyId)),
    [chainId, inputCurrencyId],
  )

  // Track stability to prevent flickering during initial load
  useEffect(() => {
    if (prevInputCurrencyIdRef.current !== inputCurrencyId) {
      setIsStable(false)
      prevInputCurrencyIdRef.current = inputCurrencyId
    }

    // Mark as stable after a short delay for initial load
    const timer = setTimeout(() => {
      setIsStable(true)
    }, 50)

    return () => clearTimeout(timer)
  }, [inputCurrencyId])

  // Return false during unstable state to prevent flickering
  return isStable ? isNativeIn : false
}

export function useIsNativeOut(): boolean {
  const { chainId } = useWalletInfo()
  const { state } = useTradeState()
  const { outputCurrencyId } = state || {}

  return useMemo(
    () => Boolean(outputCurrencyId && getIsNativeToken(chainId, outputCurrencyId)),
    [chainId, outputCurrencyId],
  )
}
