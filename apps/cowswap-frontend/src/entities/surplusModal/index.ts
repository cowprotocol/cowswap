import { atom, useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'

export type OrdersToDisplayModal = {
  orderIds: string[]
}

const initialState: OrdersToDisplayModal = {
  orderIds: [],
}

const surplusModalAtom = atom<OrdersToDisplayModal>(initialState)

const surplusModalOrderIdsAtom = atom((get) => get(surplusModalAtom).orderIds)

const addSurplusOrderAtom = atom(null, (get, set, orderId: string) =>
  set(surplusModalAtom, () => {
    const state = get(surplusModalAtom)

    state.orderIds.push(orderId)

    return { ...state }
  }),
)

export const removeSurplusOrderAtom = atom(null, (get, set, orderId: string) =>
  set(surplusModalAtom, () => {
    const state = get(surplusModalAtom)

    state.orderIds = state.orderIds.filter((id) => id !== orderId)

    return { ...state }
  }),
)

const orderIdForSurplusModalAtom = atom<string | undefined>((get) => {
  const state = get(surplusModalAtom)

  if (state.orderIds.length === 0) {
    return undefined
  }

  return state.orderIds[0]
})

export function useAddOrderToSurplusQueue(): (orderId: string) => void {
  return useSetAtom(addSurplusOrderAtom)
}

export function useOrderIdForSurplusModal(): string | undefined {
  return useAtomValue(orderIdForSurplusModalAtom)
}

export function useRemoveOrderFromSurplusQueue(): (orderId: string) => void {
  return useSetAtom(removeSurplusOrderAtom)
}

export function useSurplusQueueOrderIds(): string[] {
  return useAtomValue(surplusModalOrderIdsAtom)
}
