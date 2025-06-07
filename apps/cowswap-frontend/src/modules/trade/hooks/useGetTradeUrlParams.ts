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
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
            // Keep inputCurrencyId because it's always from supported chain
            inputCurrencyId: tradeContext.inputCurrencyId || null,
            outputCurrencyId: defaultState?.outputCurrencyId || null,
          } as TradeUrlParams)
        : tradeContext
    },
    [tradeContext, isCurrentTradeBridging],
  )
}
