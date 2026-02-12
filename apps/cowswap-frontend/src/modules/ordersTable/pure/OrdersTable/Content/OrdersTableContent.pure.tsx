import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useOrdersTableFilters } from 'modules/ordersTable/hooks/useOrdersTableFilters'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { OrdersTableNoOrdersContent } from './NoOrders/OrdersTableNoOrdersContent'
import { OrdersTableNoWalletContent } from './NoWallet/OrdersTableNoWalletContent'
import { OrdersTableUnsupportedNetworkContent } from './UnsupportedNetwork/OrdersTableUnsupportedNetworkContent'

import { useOrdersTableState } from '../../../hooks/useOrdersTableState'
import { OrderTabId } from '../../../state/tabs/ordersTableTabs.constants'
import { HistoryStatusFilter } from '../../../utils/getFilteredOrders'
import { OrdersTable } from '../OrdersTable.pure'

interface OrdersTableContentProps {
  currentTab: OrderTabId
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
}

export function OrdersTableContent({
  currentTab,
  searchTerm,
  historyStatusFilter,
}: OrdersTableContentProps): ReactNode {
  const { orders, filteredOrders, hasHydratedOrders } = useOrdersTableState() || {}
  const { orderType, displayOrdersOnlyForSafeApp } = useOrdersTableFilters() || {}
  const isHydrated = !!hasHydratedOrders
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const { account } = useWalletInfo()

  if (!account) {
    return <OrdersTableNoWalletContent orderType={orderType} />
  }

  if (isProviderNetworkUnsupported) {
    return <OrdersTableUnsupportedNetworkContent />
  }

  return filteredOrders?.length === 0 ? (
    <OrdersTableNoOrdersContent
      orderType={orderType}
      currentTab={currentTab}
      searchTerm={searchTerm}
      historyStatusFilter={historyStatusFilter}
      hasHydratedOrders={isHydrated}
      displayOrdersOnlyForSafeApp={displayOrdersOnlyForSafeApp}
      hasOrders={!!orders?.length}
    />
  ) : (
    <OrdersTable currentTab={currentTab} />
  )
}
