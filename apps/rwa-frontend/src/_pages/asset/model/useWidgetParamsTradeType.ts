import { useStore } from 'jotai'
import { useMemo } from 'react'

import type { CowSwapWidgetParams } from '@cowprotocol/widget-lib'

import { tradeTypeAtom } from './tradeTypeAtom'

/**
 * Adds the remembered widget tab to the params, only when the other params change.
 * The widget force-navigates on any params change and resets the amounts, so a tab opened in the widget must not
 * reach it on its own: market data refetches rebuild the params with the same content.
 */
export function useWidgetParamsTradeType(params: CowSwapWidgetParams | null): CowSwapWidgetParams | null {
  const store = useStore()
  const paramsKey = JSON.stringify(params)

  return useMemo(() => {
    const keyedParams: CowSwapWidgetParams | null = JSON.parse(paramsKey)

    return keyedParams && { ...keyedParams, tradeType: store.get(tradeTypeAtom) }
  }, [paramsKey, store])
}
