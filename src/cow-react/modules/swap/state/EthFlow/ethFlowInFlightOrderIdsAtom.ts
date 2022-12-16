import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const ethFlowInFlightOrderIdsAtom = atomWithStorage<string[]>('eth-flow-in-flight-order-ids:v1', [])

export const addInFlightOrderIdAtom = atom(null, (get, set, orderId: string) => {
  const orderIds = get(ethFlowInFlightOrderIdsAtom)

  set(ethFlowInFlightOrderIdsAtom, [...orderIds, orderId])
  console.log('[flight] Add', orderId, orderIds)
})

export const removeInFlightOrderIdAtom = atom(null, (get, set, orderId: string) => {
  const orderIds = get(ethFlowInFlightOrderIdsAtom)

  set(
    ethFlowInFlightOrderIdsAtom,
    orderIds.filter((order) => order !== orderId)
  )
  console.log('[flight] Remove', orderId, orderIds)
})
