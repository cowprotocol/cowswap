import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { useMediaQuery } from '@cowprotocol/common-hooks'
import { Media } from '@cowprotocol/ui'

import { useSetOrdersTableDrawerOpen, useTradeConfirmActions } from 'modules/trade'

import { useNavigateToOrdersTableTab } from './tabs/useNavigateToOrdersTableTab'
import { useRevealOrderInOrdersTable } from './useRevealOrderInOrdersTable'

import { placedOrderHighlightAtom } from '../state/placedOrderHighlightAtom'

export function useViewPlacedOrder(onDismiss?: () => void): () => void {
  const placedOrder = useAtomValue(placedOrderHighlightAtom)
  const { onDismiss: dismissTradeConfirm } = useTradeConfirmActions()
  const setOrdersTableDrawerOpen = useSetOrdersTableDrawerOpen()
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const revealOrderInOrdersTable = useRevealOrderInOrdersTable()
  const navigateToOrdersTableTab = useNavigateToOrdersTableTab()

  return useCallback(() => {
    if (onDismiss) {
      onDismiss()
    } else {
      dismissTradeConfirm()
    }

    if (isUpToLarge) {
      setOrdersTableDrawerOpen(true)
    }

    if (!placedOrder) {
      return
    }

    if (placedOrder.orderId) {
      revealOrderInOrdersTable(placedOrder.orderId, placedOrder.tabId, { revealWhenInDrawer: true })
      return
    }

    navigateToOrdersTableTab(placedOrder.tabId)
  }, [
    dismissTradeConfirm,
    isUpToLarge,
    navigateToOrdersTableTab,
    onDismiss,
    placedOrder,
    revealOrderInOrdersTable,
    setOrdersTableDrawerOpen,
  ])
}
