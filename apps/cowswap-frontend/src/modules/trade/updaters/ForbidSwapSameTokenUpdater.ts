import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useDerivedTradeState } from '../hooks/useDerivedTradeState'
import { useTradeNavigate } from '../hooks/useTradeNavigate'
import { getDefaultTradeRawState } from '../types'

export function ForbidSwapSameTokenUpdater(): null {
  const { chainId } = useWalletInfo()
  const navigate = useTradeNavigate()
  const { inputCurrency, outputCurrency } = useDerivedTradeState() || {}

  const areCurrenciesEqual = Boolean(inputCurrency && outputCurrency && inputCurrency.equals(outputCurrency))

  useEffect(() => {
    if (!areCurrenciesEqual) return

    const defaultState = getDefaultTradeRawState(chainId)
    navigate(chainId, defaultState)
  }, [areCurrenciesEqual, chainId, navigate])

  return null
}
