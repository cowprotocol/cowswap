import { useCallback } from 'react'

import { switchTokensAnalytics } from '@cowprotocol/analytics'
import { FractionUtils } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'
import { useTradeNavigate } from './useTradeNavigate'
import { useTradeState } from './useTradeState'

import { ExtendedTradeRawState } from '../types/TradeRawState'

const EMPTY_CURRENCY_ID = '_'

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
    if (!updateState) return

    if (!isWrapOrUnwrap) {
      switchTokensAnalytics()
      updateState({
        inputCurrencyId: outputCurrencyId,
        outputCurrencyId: inputCurrencyId,
        inputCurrencyAmount: FractionUtils.serializeFractionToJSON(outputCurrencyAmount),
        outputCurrencyAmount: FractionUtils.serializeFractionToJSON(inputCurrencyAmount),
        ...stateOverride,
      })
    }

    tradeNavigate(chainId, {
      inputCurrencyId: outputCurrencyId || EMPTY_CURRENCY_ID,
      outputCurrencyId: inputCurrencyId || EMPTY_CURRENCY_ID,
    })
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
