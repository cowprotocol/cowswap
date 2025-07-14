import { ReactNode } from 'react'

import { ConnectWalletContent } from './ConnectWalletContent'
import { NoOrdersContent } from './NoOrdersContent'
import { OrdersTable } from './OrdersTable'

import { OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'

interface OrdersTableContentProps {
  currentTab: OrderTabId
  searchTerm?: string
}

export function OrdersTableContent({ searchTerm, currentTab }: OrdersTableContentProps): ReactNode {
  const { filteredOrders, isWalletConnected } = useOrdersTableState() || {}

  if (!isWalletConnected) {
    return <ConnectWalletContent />
  }

  if (filteredOrders?.length === 0) {
    return <NoOrdersContent currentTab={currentTab} searchTerm={searchTerm} />
  }

  return <OrdersTable currentTab={currentTab} />
}
