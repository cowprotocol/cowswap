import { atom } from 'jotai'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'

export interface ReceiptState {
  selected: ParsedOrder | null
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
