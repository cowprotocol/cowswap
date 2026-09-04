import { useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useTradeNavigate } from 'common/modules/tradeNavigation'

import { useDerivedTradeState } from '../hooks/useDerivedTradeState'
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
