import { atom } from 'jotai'

import { TradeAmounts } from '../types/TradeAmounts'

interface TradeConfirmModalState {
  isOpen: boolean
  pendingTrade: TradeAmounts | null
  transactionHash: string | null
  error: string | null
}

export const tradeConfirmStateAtom = atom<TradeConfirmModalState>({
  isOpen: false,
  pendingTrade: null,
  transactionHash: null,
  error: null,
})

export const updateTradeConfirmStateAtom = atom(null, (get, set, nextState: Partial<TradeConfirmModalState>) => {
  set(tradeConfirmStateAtom, () => {
    const currentState = get(tradeConfirmStateAtom)

    if (nextState.isOpen === true) {
      return {
        isOpen: true,
        error: null,
        pendingTrade: null,
        transactionHash: null, //
      }
    }

    if (nextState.isOpen === false) {
      return {
        ...currentState,
        isOpen: false,
      }
    }

    if (nextState.error) {
      return {
        isOpen: currentState.isOpen,
        error: nextState.error,
        pendingTrade: null,
        transactionHash: null, //
      }
    }

    if (nextState.pendingTrade) {
      return {
        isOpen: currentState.isOpen,
        error: null,
        pendingTrade: nextState.pendingTrade,
        transactionHash: null, //
      }
    }

    if (nextState.transactionHash) {
      return {
        isOpen: currentState.isOpen,
        error: null,
        pendingTrade: null,
        transactionHash: nextState.transactionHash,
      }
    }

    return get(tradeConfirmStateAtom)
  })
})
