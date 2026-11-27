import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { TradeType } from '@cowprotocol/widget-lib'

export const ENABLED_TRADE_TYPES: readonly TradeType[] = [TradeType.SWAP, TradeType.LIMIT, TradeType.ADVANCED]

const storedTradeTypeAtom = atomWithStorage<TradeType>('rwaTradeType:v1', TradeType.SWAP, undefined, {
  getOnInit: true,
})

/** Widget tab the user last opened, kept across network changes and page loads */
export const tradeTypeAtom = atom(
  (get) => {
    const tradeType = get(storedTradeTypeAtom)

    return ENABLED_TRADE_TYPES.includes(tradeType) ? tradeType : TradeType.SWAP
  },
  (_get, set, tradeType: TradeType) => set(storedTradeTypeAtom, tradeType),
)
