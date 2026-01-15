import { ReactNode } from 'react'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { ConnectWalletContent } from './ConnectWalletContent'
import { NoOrdersContent } from './NoOrdersContent'
import { OrdersTable } from './OrdersTable'
import { UnsupportedNetworkContent } from './UnsupportedNetworkContent'

import { OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'

interface OrdersTableContentProps {
  currentTab: OrderTabId
  searchTerm?: string
  showOnlyFilled?: boolean
  isDarkMode: boolean
}

export function OrdersTableContent({
  searchTerm,
  showOnlyFilled,
  currentTab,
  isDarkMode,
}: OrdersTableContentProps): ReactNode {
  const { filteredOrders, isWalletConnected, hasHydratedOrders } = useOrdersTableState() || {}
  const isHydrated = !!hasHydratedOrders
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  if (!isWalletConnected) {
    return <ConnectWalletContent />
  }

  if (isProviderNetworkUnsupported) {
    return <UnsupportedNetworkContent />
  }

  if (filteredOrders?.length === 0) {
    return (
      <NoOrdersContent
        currentTab={currentTab}
        searchTerm={searchTerm}
        showOnlyFilled={showOnlyFilled}
        hasHydratedOrders={isHydrated}
        isDarkMode={isDarkMode}
      />
    )
  }

  return <OrdersTable currentTab={currentTab} />
}
