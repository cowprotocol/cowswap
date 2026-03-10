import { useCallback } from 'react'

import { IMenuItem, Routes } from 'common/constants/routes'

import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'
import { useTradeRouteContext } from './useTradeRouteContext'

import { getDefaultTradeRawState, TradeUrlParams } from '../types'

/**
 * Bridging mode is currently enabled only in Swap or Hooks.
 * When we navigate from Swap or Hooks to anywhere else and currently selected trade is bridging.
 * Then navigate to the target widget with default assets.
 */
export function useGetTradeUrlParams(): (item: IMenuItem) => TradeUrlParams {
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const tradeContext = useTradeRouteContext()

  return useCallback(
    (item: IMenuItem): TradeUrlParams => {
      const isItemSwapOrHooks = item.route === Routes.SWAP || item.route === Routes.HOOKS
      const chainId = tradeContext.chainId
      const defaultState = chainId ? getDefaultTradeRawState(+chainId) : null

      return isCurrentTradeBridging && !isItemSwapOrHooks
        ? ({
            chainId,
            // Keep inputCurrencyId because it's always from supported chain
            inputCurrencyId: tradeContext.inputCurrencyId || null,
            outputCurrencyId: defaultState?.outputCurrencyId || null,
          } as TradeUrlParams)
        : tradeContext
    },
    [tradeContext, isCurrentTradeBridging],
  )
}
