import { atom } from 'jotai'

import { TradeAmounts } from 'common/types'

interface TradeConfirmModalState {
  isOpen: boolean
  pendingTrade: TradeAmounts | null
  transactionHash: string | null
  error: string | null
  permitSignatureState: undefined | 'requested' | 'signed'
}

export const tradeConfirmStateAtom = atom<TradeConfirmModalState>({
  isOpen: false,
  pendingTrade: null,
  transactionHash: null,
  error: null,
  permitSignatureState: undefined,
})

export const setOpenTradeConfirmAtom = atom(null, (get, set) => {
  set(tradeConfirmStateAtom, () => ({
    isOpen: true,
    error: null,
    pendingTrade: null,
    transactionHash: null,
    permitSignatureState: undefined,
  }))
})

export const setCloseTradeConfirmAtom = atom(null, (get, set) => {
  set(tradeConfirmStateAtom, () => ({
    ...get(tradeConfirmStateAtom),
    isOpen: false,
    error: null,
    pendingTrade: null,
    permitSignatureState: undefined,
  }))
})

export const setErrorTradeConfirmAtom = atom(null, (get, set, error: string) => {
  set(tradeConfirmStateAtom, () => ({
    ...get(tradeConfirmStateAtom),
    error,
    isOpen: false,
    pendingTrade: null,
    transactionHash: null,
    permitSignatureState: undefined,
  }))
})

export const setPermitSignatureRequestedTradeConfirmAtom = atom(null, (get, set, pendingTrade: TradeAmounts) => {
  set(tradeConfirmStateAtom, () => ({
    ...get(tradeConfirmStateAtom),
    pendingTrade,
    permitSignatureState: 'requested',
  }))
})

export const setPendingTradeConfirmAtom = atom(null, (get, set, pendingTrade: TradeAmounts) => {
  const currentState = get(tradeConfirmStateAtom)

  set(tradeConfirmStateAtom, () => {
    return {
      ...currentState,
      error: null,
      pendingTrade,
      transactionHash: null,
      // Only move to the next state if coming in the right sequence.
      // Otherwise, reset it
      permitSignatureState: currentState.permitSignatureState === 'requested' ? 'signed' : undefined,
    }
  })
})

export const setTxHashTradeConfirmAtom = atom(null, (get, set, transactionHash: string) => {
  set(tradeConfirmStateAtom, () => ({
    ...get(tradeConfirmStateAtom),
    error: null,
    pendingTrade: null,
    transactionHash,
  }))
})
