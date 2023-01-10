import { atom } from 'jotai'

export interface ReceiptState {
  orderId: string | null
}

export const receiptAtom = atom<ReceiptState>({
  orderId: null,
})

export const updateReceiptAtom = atom(null, (get, set, nextState: Partial<ReceiptState>) => {
  set(receiptAtom, () => {
    const prevState = get(receiptAtom)

    return { ...prevState, ...nextState }
  })
})
