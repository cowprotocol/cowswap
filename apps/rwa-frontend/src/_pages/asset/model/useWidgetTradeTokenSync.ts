import { useSetAtom } from 'jotai'
import { useMemo, useRef } from 'react'

import { type CowWidgetEventListeners, CowWidgetEvents } from '@cowprotocol/events'

import { tradeTokenKeyAtom } from './tradeSelectionAtoms'

import { findWidgetTradeToken } from '../lib/widgetTradeToken'

import type { TradeSelection } from './useTradeSelection'

import { getTokenKey, type RwaAsset } from '@/entities/asset'

/** Widget listeners that select the asset token picked in the widget in the token selector */
export function useWidgetTradeTokenSync(asset: RwaAsset, selection: TradeSelection | null): CowWidgetEventListeners {
  const setTokenKey = useSetAtom(tradeTokenKeyAtom)
  const lastWidgetTokenKeyRef = useRef<string | null>(null)
  const chainId = selection?.chainId
  const side = selection?.side
  const assetToken = selection?.assetToken

  return useMemo(() => {
    if (!side || !assetToken) return []

    // The sell network follows the wallet, so a sell token of another network applies once the wallet switches to it.
    // A buy token of another network is a bridge target and must not move the traded network.
    const tradedTokens = side === 'sell' ? asset.tokens : asset.tokens.filter((token) => token.chainId === chainId)

    return [
      {
        event: CowWidgetEvents.ON_CHANGE_TRADE_PARAMS,
        handler: (payload) => {
          const widgetToken = findWidgetTradeToken(payload, side, tradedTokens)
          const widgetTokenKey = widgetToken ? getTokenKey(widgetToken) : null
          // The widget repeats the params on every amount or quote change, and an event sent before it applied a
          // token picked above the widget would still carry the previous one: only a change made in the widget counts
          const isWidgetChange = widgetTokenKey !== lastWidgetTokenKeyRef.current

          lastWidgetTokenKeyRef.current = widgetTokenKey

          if (widgetToken && isWidgetChange && widgetToken !== assetToken) setTokenKey(getTokenKey(widgetToken))
        },
      },
    ]
  }, [asset.tokens, chainId, side, assetToken, setTokenKey])
}
