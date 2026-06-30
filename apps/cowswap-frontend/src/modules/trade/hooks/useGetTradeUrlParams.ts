import { useCallback } from 'react'

import { IMenuItem, Routes } from 'common/constants/routes'

import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'
import { useTradeRouteContext } from './useTradeRouteContext'

import { getDefaultTradeRawState, TradeUrlParams } from '../types'

/**
 * Bridging mode is currently enabled only on the Swap tab.
 * When we navigate from a bridging Swap to anywhere else (Hooks included),
 * drop the cross-chain reference and fall back to the target widget's default assets.
 */
export function useGetTradeUrlParams(): (item: IMenuItem) => TradeUrlParams {
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const tradeContext = useTradeRouteContext()

  return useCallback(
    (item: IMenuItem): TradeUrlParams => {
      const isItemSwap = item.route === Routes.SWAP
      const chainId = tradeContext.chainId
      const defaultState = chainId ? getDefaultTradeRawState(+chainId) : null

      return isCurrentTradeBridging && !isItemSwap
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
