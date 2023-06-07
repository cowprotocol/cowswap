import { useCallback } from 'react'

import { useWalletInfo } from 'modules/wallet'

import { FractionUtils } from 'utils/fractionUtils'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'
import { useTradeNavigate } from './useTradeNavigate'
import { useTradeState } from './useTradeState'

import { ExtendedTradeRawState } from '../types/TradeRawState'

// TODO: when implementing this for SWAP remmeber this logic related to ETH flow
// https://github.com/cowprotocol/cowswap/blob/628c62596d65e0761ccf70677a55bec9a0a36411/src/legacy/state/swap/reducer.ts#L143
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
    if (!isWrapOrUnwrap) {
      updateState({
        inputCurrencyId: outputCurrencyId,
        outputCurrencyId: inputCurrencyId,
        inputCurrencyAmount: FractionUtils.serializeFractionToJSON(outputCurrencyAmount),
        outputCurrencyAmount: FractionUtils.serializeFractionToJSON(inputCurrencyAmount),
        ...stateOverride,
      })
    }

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
