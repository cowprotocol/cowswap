import { useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { OrderTabId } from 'entities/routes/routes.atom'

import { useRevealOrderInOrdersTable } from 'modules/ordersTable'
import { useSetOrdersTableDrawerOpen } from 'modules/trade'

import { useEoaTwapSigningStep } from './useEoaTwapSigningStep'

export function useEoaTwapSuccessDismiss(onDismiss: () => void): () => void {
  const setOrdersTableDrawerOpen = useSetOrdersTableDrawerOpen()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const revealOrderInOrdersTable = useRevealOrderInOrdersTable()
  const orderId = useEoaTwapSigningStep()?.eventId

  return useCallback(() => {
    onDismiss()

    if (!isUpToLarge) {
      return
    }

    setOrdersTableDrawerOpen(true)

    if (orderId) {
      revealOrderInOrdersTable(orderId, OrderTabId.OPEN)
    }
  }, [isUpToLarge, onDismiss, orderId, revealOrderInOrdersTable, setOrdersTableDrawerOpen])
}
