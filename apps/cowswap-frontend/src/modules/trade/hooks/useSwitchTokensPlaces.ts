import { useCallback } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { FractionUtils } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'

import { CowSwapAnalyticsCategory } from 'common/analytics/types'

import { useDerivedTradeState } from './useDerivedTradeState'
import { useIsWrapOrUnwrap } from './useIsWrapOrUnwrap'
import { useTradeNavigate } from './useTradeNavigate'
import { useTradeState } from './useTradeState'

import { ExtendedTradeRawState } from '../types/TradeRawState'

const EMPTY_CURRENCY_ID = '_'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSwitchTokensPlaces(stateOverride: Partial<ExtendedTradeRawState> = {}) {
  const { chainId } = useWalletInfo()
  const tradeState = useTradeState()
  const { inputCurrencyAmount, outputCurrencyAmount } = useDerivedTradeState() || {}
  const isWrapOrUnwrap = useIsWrapOrUnwrap()
  const tradeNavigate = useTradeNavigate()

  const { inputCurrencyId, outputCurrencyId } = tradeState?.state || {}
  const updateState = tradeState?.updateState

  const cowAnalytics = useCowAnalytics()

  return useCallback(() => {
    if (!updateState) return

    if (!isWrapOrUnwrap) {
      cowAnalytics.sendEvent({
        category: CowSwapAnalyticsCategory.TRADE,
        action: 'Switch INPUT/OUTPUT tokens',
      })
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
    cowAnalytics,
  ])
}
