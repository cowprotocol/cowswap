import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { OrdersTable } from '../OrdersTable.pure'
import { OrdersTableUnsupportedNetworkContent } from './UnsupportedNetwork/OrdersTableUnsupportedNetworkContent'
import { OrdersTableNoWalletContent } from './NoWallet/OrdersTableNoWalletContent'
import { OrdersTableNoOrdersContent } from './NoOrders/OrdersTableNoOrdersContent'

import { OrderTabId } from '../../../const/tabs'
import { HistoryStatusFilter } from '../../../hooks/useFilteredOrders'
import { useOrdersTableState } from '../../../hooks/useOrdersTableState'

interface OrdersTableContentProps {
  currentTab: OrderTabId
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
}

export function OrdersTableContent({
  searchTerm,
  historyStatusFilter,
  currentTab,
}: OrdersTableContentProps): ReactNode {
  const { filteredOrders, hasHydratedOrders } = useOrdersTableState() || {}
  const isHydrated = !!hasHydratedOrders
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const { account } = useWalletInfo()

  if (!account) {
    return <OrdersTableNoWalletContent />
  }

  if (isProviderNetworkUnsupported) {
    return <OrdersTableUnsupportedNetworkContent />
  }

  return filteredOrders?.length === 0 ? (
    <OrdersTableNoOrdersContent
      currentTab={currentTab}
      searchTerm={searchTerm}
      historyStatusFilter={historyStatusFilter}
      hasHydratedOrders={isHydrated}
    />
  ) : (
    <OrdersTable currentTab={currentTab} />
  )
}
