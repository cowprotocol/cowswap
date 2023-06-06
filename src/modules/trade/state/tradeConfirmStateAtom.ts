import { atom } from 'jotai'

import { TradeConfirmationProps } from '../pure/TradeConfirmation'

interface TradeConfirmModalState {
  isPending: boolean
  transactionHash: string | null
  error: string | null
  confirmationState: TradeConfirmationProps | null
}

export const tradeConfirmStateAtom = atom<TradeConfirmModalState>({
  isPending: false,
  transactionHash: null,
  error: null,
  confirmationState: null,
})

export const updateTradeConfirmStateAtom = atom(null, (get, set, nextState: Partial<TradeConfirmModalState>) => {
  set(tradeConfirmStateAtom, () => {
    const prevState = get(tradeConfirmStateAtom)

    return { ...prevState, ...nextState }
  })
})
