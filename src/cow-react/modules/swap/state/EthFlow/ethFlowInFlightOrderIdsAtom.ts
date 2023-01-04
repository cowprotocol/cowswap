import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

export const ethFlowInFlightOrderIdsAtom = atomWithStorage<string[]>('eth-flow-in-flight-order-ids:v0', [])

export const addInFlightOrderIdAtom = atom(null, (get, set, orderId: string) => {
  const orderIds = get(ethFlowInFlightOrderIdsAtom)

  set(ethFlowInFlightOrderIdsAtom, [...orderIds, orderId])
})

export const removeInFlightOrderIdAtom = atom(null, (get, set, orderId: string) => {
  const orderIds = get(ethFlowInFlightOrderIdsAtom)

  set(
    ethFlowInFlightOrderIdsAtom,
    orderIds.filter((order) => order !== orderId)
  )
})
