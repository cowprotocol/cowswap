import { atom, useAtomValue } from 'jotai'
import { useSetAtom } from 'jotai'

export type OrdersToDisplayModal = {
  orderIds: string[]
  isConfirmationModalOpen: boolean
}

const initialState: OrdersToDisplayModal = {
  orderIds: [],
  isConfirmationModalOpen: false,
}

const surplusModalAtom = atom<OrdersToDisplayModal>(initialState)

export const addSurplusOrderAtom = atom(null, (get, set, orderId: string) =>
  set(surplusModalAtom, () => {
    const state = get(surplusModalAtom)

    // If the confirmation modal is open, we don't want to add the order to the queue
    if (state.isConfirmationModalOpen) {
      return state
    }

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

export const setIsConfirmationModalOpenAtom = atom(null, (get, set, isOpen: boolean) =>
  set(surplusModalAtom, () => {
    const state = get(surplusModalAtom)

    if (state.isConfirmationModalOpen === isOpen) {
      // Nothing changed, avoid re-rendering
      return state
    }

    return {
      ...state,
      isConfirmationModalOpen: isOpen,
    }
  })
)

export const orderIdForSurplusModalAtom = atom<string | undefined>((get) => {
  const state = get(surplusModalAtom)

  if (state.orderIds.length === 0 || state.isConfirmationModalOpen) {
    return undefined
  }

  return state.orderIds[0]
})

export function useSetIsConfirmationModalOpen() {
  return useSetAtom(setIsConfirmationModalOpenAtom)
}

export function useAddOrderToSurplusQueue() {
  return useSetAtom(addSurplusOrderAtom)
}

export function useOrderIdForSurplusModal() {
  return useAtomValue(orderIdForSurplusModalAtom)
}

export function useRemoveOrderFromSurplusQueue() {
  return useSetAtom(removeSurplusOrderAtom)
}
