import { useCallback } from 'react'

import { useIsCurrentTradeBridging } from './useIsCurrentTradeBridging'
import { useTradeRouteContext } from './useTradeRouteContext'

import { IMenuItem, Routes } from '../../../common/constants/routes'
import { getDefaultTradeRawState, TradeUrlParams } from '../types'

/**
 * Bridging mode is currently enabled only in Swap
 * When we navigate from Swap to anywhere else and currently selected trade is bridging
 * Then navigate to the target widget with default assets
 */
export function useGetTradeUrlParams() {
  const isCurrentTradeBridging = useIsCurrentTradeBridging()
  const tradeContext = useTradeRouteContext()

  return useCallback(
    (item: IMenuItem) => {
      const isItemSwap = item.route === Routes.SWAP
      const chainId = tradeContext.chainId
      const defaultState = chainId ? getDefaultTradeRawState(+chainId) : null

      return isCurrentTradeBridging && !isItemSwap
        ? ({
            chainId,
            inputCurrencyId: defaultState?.inputCurrencyId || null,
            outputCurrencyId: defaultState?.outputCurrencyId || null,
          } as TradeUrlParams)
        : tradeContext
    },
    [tradeContext, isCurrentTradeBridging],
  )
}
