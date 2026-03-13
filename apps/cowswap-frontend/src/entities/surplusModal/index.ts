import { atom, useAtomValue, useSetAtom } from 'jotai'

export type OrdersToDisplayModal = {
  orderIds: string[]
  autoQueuedOrderIds: string[]
  autoShownOrderIds: string[]
}

const initialState: OrdersToDisplayModal = {
  orderIds: [],
  autoQueuedOrderIds: [],
  autoShownOrderIds: [],
}

const surplusModalAtom = atom<OrdersToDisplayModal>(initialState)

const surplusModalOrderIdsAtom = atom((get) => get(surplusModalAtom).orderIds)

function appendOrderId(orderIds: string[], orderId: string): string[] {
  return orderIds.includes(orderId) ? orderIds : [...orderIds, orderId]
}

const addSurplusOrderAtom = atom(null, (get, set, orderId: string) => {
  const state = get(surplusModalAtom)
  const orderIds = appendOrderId(state.orderIds, orderId)

  if (orderIds === state.orderIds) {
    return
  }

  set(surplusModalAtom, { ...state, orderIds })
})

const autoAddSurplusOrderAtom = atom(null, (get, set, orderId: string) => {
  const state = get(surplusModalAtom)

  if (state.autoShownOrderIds.includes(orderId)) {
    return
  }

  set(surplusModalAtom, {
    orderIds: appendOrderId(state.orderIds, orderId),
    autoQueuedOrderIds: appendOrderId(state.autoQueuedOrderIds, orderId),
    autoShownOrderIds: state.autoShownOrderIds,
  })
})

const markSurplusOrderAutoShownAtom = atom(null, (get, set, orderId: string) => {
  const state = get(surplusModalAtom)

  if (!state.autoQueuedOrderIds.includes(orderId) || state.autoShownOrderIds.includes(orderId)) {
    return
  }

  set(surplusModalAtom, {
    orderIds: state.orderIds,
    autoQueuedOrderIds: state.autoQueuedOrderIds.filter((id) => id !== orderId),
    autoShownOrderIds: [...state.autoShownOrderIds, orderId],
  })
})

export const removeSurplusOrderAtom = atom(null, (get, set, orderId: string) => {
  const state = get(surplusModalAtom)
  const orderIds = state.orderIds.filter((id) => id !== orderId)
  const autoQueuedOrderIds = state.autoQueuedOrderIds.filter((id) => id !== orderId)

  if (orderIds.length === state.orderIds.length && autoQueuedOrderIds.length === state.autoQueuedOrderIds.length) {
    return
  }

  set(surplusModalAtom, { ...state, orderIds, autoQueuedOrderIds })
})

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

export function useAutoAddOrderToSurplusQueue(): (orderId: string) => void {
  return useSetAtom(autoAddSurplusOrderAtom)
}

export function useMarkSurplusOrderAutoShown(): (orderId: string) => void {
  return useSetAtom(markSurplusOrderAutoShownAtom)
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
