import { useStore } from 'jotai'
import { useMemo } from 'react'

import { type CowWidgetEventListeners, CowWidgetEvents } from '@cowprotocol/events'
import { TradeType } from '@cowprotocol/widget-lib'

import { tradeTypeAtom } from './tradeTypeAtom'

const ORDER_TYPE_TRADE_TYPES: Partial<Record<string, TradeType>> = {
  SWAP: TradeType.SWAP,
  LIMIT: TradeType.LIMIT,
  TWAP: TradeType.ADVANCED,
}

/** Widget listeners that remember the widget tab, so a params update or a page load reopens it */
export function useWidgetTradeTypeSync(): CowWidgetEventListeners {
  const store = useStore()

  return useMemo(
    () => [
      {
        event: CowWidgetEvents.ON_CHANGE_TRADE_PARAMS,
        handler: ({ orderType }) => {
          const tradeType = ORDER_TYPE_TRADE_TYPES[orderType]

          if (tradeType && tradeType !== store.get(tradeTypeAtom)) store.set(tradeTypeAtom, tradeType)
        },
      },
    ],
    [store],
  )
}
