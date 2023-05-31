import { useCallback } from 'react'

import { useWalletInfo } from 'modules/wallet'

import { FractionUtils } from 'utils/fractionUtils'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'
import { useTradeNavigate } from './useTradeNavigate'
import { useTradeState } from './useTradeState'

import { ExtendedTradeRawState } from '../types/TradeRawState'

export function useSwitchTokensPlaces(stateOverride: Partial<ExtendedTradeRawState> = {}) {
  const { chainId } = useWalletInfo()
  const tradeState = useTradeState()
  const { inputCurrencyAmount, outputCurrencyAmount } = useDerivedTradeState()?.state || {}
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const tradeNavigate = useTradeNavigate()

  const { inputCurrencyId, outputCurrencyId } = tradeState?.state || {}
  const updateState = tradeState?.updateState

  return useCallback(() => {
    if (!inputCurrencyId || !outputCurrencyId || !updateState) return
    if (isWrapOrUnwrap) return

    updateState({
      inputCurrencyId: outputCurrencyId,
      outputCurrencyId: inputCurrencyId,
      inputCurrencyAmount: FractionUtils.serializeFractionToJSON(outputCurrencyAmount),
      outputCurrencyAmount: FractionUtils.serializeFractionToJSON(inputCurrencyAmount),
      ...stateOverride,
    })
    tradeNavigate(chainId, { inputCurrencyId: outputCurrencyId, outputCurrencyId: inputCurrencyId })
  }, [
    updateState,
    isWrapOrUnwrap,
    tradeNavigate,
    chainId,
    inputCurrencyId,
    outputCurrencyId,
    inputCurrencyAmount,
    outputCurrencyAmount,
    stateOverride,
  ])
}
