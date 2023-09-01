import { atom } from 'jotai'

import { TradeAmounts } from 'common/types'

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

export const setOpenTradeConfirmAtom = atom(null, (get, set) => {
  set(tradeConfirmStateAtom, () => {
    return {
      isOpen: true,
      error: null,
      pendingTrade: null,
      transactionHash: null,
    }
  })
})

export const setCloseTradeConfirmAtom = atom(null, (get, set) => {
  set(tradeConfirmStateAtom, () => {
    return {
      ...get(tradeConfirmStateAtom),
      isOpen: false,
    }
  })
})

export const setErrorTradeConfirmAtom = atom(null, (get, set, error: string) => {
  set(tradeConfirmStateAtom, () => {
    const currentState = get(tradeConfirmStateAtom)

    return {
      isOpen: currentState.isOpen,
      error,
      pendingTrade: null,
      transactionHash: null,
    }
  })
})

export const setPendingTradeConfirmAtom = atom(null, (get, set, pendingTrade: TradeAmounts) => {
  set(tradeConfirmStateAtom, () => {
    const currentState = get(tradeConfirmStateAtom)

    return {
      isOpen: currentState.isOpen,
      error: null,
      pendingTrade,
      transactionHash: null,
    }
  })
})

export const setTxHashTradeConfirmAtom = atom(null, (get, set, transactionHash: string) => {
  set(tradeConfirmStateAtom, () => {
    const currentState = get(tradeConfirmStateAtom)

    return {
      isOpen: currentState.isOpen,
      error: null,
      pendingTrade: null,
      transactionHash,
    }
  })
})
