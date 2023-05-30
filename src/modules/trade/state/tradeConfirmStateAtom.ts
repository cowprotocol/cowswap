import { atom } from 'jotai'

import { TradeAmounts } from '../types/TradeAmounts'

interface TradeConfirmModalState {
  pendingTrade: TradeAmounts | null
  transactionHash: string | null
  error: string | null
}

export const tradeConfirmStateAtom = atom<TradeConfirmModalState>({
  pendingTrade: null,
  transactionHash: null,
  error: null,
})

export const updateTradeConfirmStateAtom = atom(null, (get, set, nextState: Partial<TradeConfirmModalState>) => {
  set(tradeConfirmStateAtom, () => {
    const prevState = get(tradeConfirmStateAtom)

    return { ...prevState, ...nextState }
  })
})
