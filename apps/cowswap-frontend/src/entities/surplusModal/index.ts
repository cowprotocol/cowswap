import { atom, useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'

export type OrdersToDisplayModal = {
  orderIds: string[]
}

const initialState: OrdersToDisplayModal = {
  orderIds: [],
}

const surplusModalAtom = atom<OrdersToDisplayModal>(initialState)

export const addSurplusOrderAtom = atom(null, (get, set, orderId: string) =>
  set(surplusModalAtom, () => {
    const state = get(surplusModalAtom)

    state.orderIds.push(orderId)

    return { ...state }
  })
)

export const removeSurplusOrderAtom = atom(null, (get, set, orderId: string) =>
  set(surplusModalAtom, () => {
    const state = get(surplusModalAtom)

    state.orderIds = state.orderIds.filter((id) => id !== orderId)

    return { ...state }
  })
)

const orderIdForSurplusModalAtom = atom<string | undefined>((get) => {
  const state = get(surplusModalAtom)

  if (state.orderIds.length === 0) {
    return undefined
  }

  return state.orderIds[0]
})

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useAddOrderToSurplusQueue() {
  return useSetAtom(addSurplusOrderAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useOrderIdForSurplusModal() {
  return useAtomValue(orderIdForSurplusModalAtom)
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useRemoveOrderFromSurplusQueue() {
  return useSetAtom(removeSurplusOrderAtom)
}
