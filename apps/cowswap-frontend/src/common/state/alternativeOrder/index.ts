import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { Order } from 'legacy/state/orders/actions'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

export const isAlternativeOrderModalVisibleAtom = atom(false)
const alternativeOrderAtom = atom<Order | ParsedOrder | null>(null)

export function useIsAlternativeOrderModalVisible() {
  return useAtomValue(isAlternativeOrderModalVisibleAtom)
}

export function useUpdateAlternativeOrderModalVisible() {
  return useSetAtom(isAlternativeOrderModalVisibleAtom)
}

export function useAlternativeOrder() {
  return useAtomValue(alternativeOrderAtom)
}

export function useSetAlternativeOrder() {
  const setAlternativeOrder = useSetAtom(alternativeOrderAtom)
  const updateAlternativeOrderModalVisible = useUpdateAlternativeOrderModalVisible()

  return useCallback(
    (order: Order | ParsedOrder) => {
      // TODO: remove log
      console.log(`bug:useSetAlternativeOrder callback`, order)
      setAlternativeOrder(order)
      updateAlternativeOrderModalVisible(true)
    },
    [setAlternativeOrder, updateAlternativeOrderModalVisible]
  )
}
