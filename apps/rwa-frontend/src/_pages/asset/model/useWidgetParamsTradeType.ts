import { useStore } from 'jotai'
import { useMemo } from 'react'

import type { CowSwapWidgetParams, EthereumProvider } from '@cowprotocol/widget-lib'

import { tradeTypeAtom } from './tradeTypeAtom'

/**
 * Adds the remembered widget tab to the params, only when the other params change or the widget is recreated.
 * The widget force-navigates on any params change and resets the amounts, so a tab opened in the widget must not
 * reach it on its own: market data refetches rebuild the params with the same content.
 * A theme change doesn't pick up the tab either: the widget applies a theme-only update in place, unless the path
 * (which holds the tab) changes too.
 * A provider change recreates the iframe from these params, so it must pick up the current tab.
 */
export function useWidgetParamsTradeType(
  params: CowSwapWidgetParams | null,
  provider: EthereumProvider | undefined,
): CowSwapWidgetParams | null {
  const store = useStore()
  const paramsKey = JSON.stringify(params)
  const tradeTypeKey = JSON.stringify(params && { ...params, theme: undefined })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tradeType = useMemo(() => store.get(tradeTypeAtom), [tradeTypeKey, store, provider])

  return useMemo(() => {
    const keyedParams: CowSwapWidgetParams | null = JSON.parse(paramsKey)

    return keyedParams && { ...keyedParams, tradeType }
  }, [paramsKey, tradeType])
}
