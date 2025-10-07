import { ReactNode } from 'react'

import { ConnectWalletContent } from './ConnectWalletContent'
import { NoOrdersContent } from './NoOrdersContent'
import { OrdersTable } from './OrdersTable'

import { OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'

interface OrdersTableContentProps {
  currentTab: OrderTabId
  searchTerm?: string
  isDarkMode: boolean
}

export function OrdersTableContent({ searchTerm, currentTab, isDarkMode }: OrdersTableContentProps): ReactNode {
  const { filteredOrders, isWalletConnected, hasHydratedOrders } = useOrdersTableState() || {}
  const isHydrated = !!hasHydratedOrders

  if (!isWalletConnected) {
    return <ConnectWalletContent />
  }

  if (filteredOrders?.length === 0) {
    return (
      <NoOrdersContent
        currentTab={currentTab}
        searchTerm={searchTerm}
        hasHydratedOrders={isHydrated}
        isDarkMode={isDarkMode}
      />
    )
  }

  return <OrdersTable currentTab={currentTab} />
}
