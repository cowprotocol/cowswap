import { atom } from 'jotai'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export interface ReceiptState {
  order: ParsedOrder | null
}

export const receiptAtom = atom<ReceiptState>({
  order: null,
})

export const updateReceiptAtom = atom(null, (get, set, nextState: Partial<ReceiptState>) => {
  set(receiptAtom, () => {
    const prevState = get(receiptAtom)

    return { ...prevState, ...nextState }
  })
})
