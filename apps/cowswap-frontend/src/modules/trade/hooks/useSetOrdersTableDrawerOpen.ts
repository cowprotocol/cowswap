import { useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { updateOrdersTableDrawerAtom } from '../state/ordersTableDrawerAtom'

export function useSetOrdersTableDrawerOpen(): (isOpen: boolean) => void {
  const updateOrdersTableDrawer = useSetAtom(updateOrdersTableDrawerAtom)

  return useCallback((isOpen: boolean) => updateOrdersTableDrawer({ isOpen }), [updateOrdersTableDrawer])
}
