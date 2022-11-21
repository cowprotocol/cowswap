import { atom } from 'jotai'
import { Order } from 'state/orders/actions'

export interface ReceiptState {
  selected: Order | null
}

export const receiptAtom = atom<ReceiptState>({
  selected: null,
})

export const updateReceiptAtom = atom(null, (get, set, nextState: Partial<ReceiptState>) => {
  set(receiptAtom, () => {
    const prevState = get(receiptAtom)

    return { ...prevState, ...nextState }
  })
})
