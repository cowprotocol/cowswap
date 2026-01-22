import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { HistoryStatusFilter } from 'modules/ordersTable/hooks/useFilteredOrders'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { ConnectWalletContent } from './ConnectWalletContent'
import { NoOrdersContent } from './NoOrdersContent'
import { OrdersTable } from './OrdersTable'
import { UnsupportedNetworkContent } from './UnsupportedNetworkContent'

import { OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'

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
    return <ConnectWalletContent />
  }

  if (isProviderNetworkUnsupported) {
    return <UnsupportedNetworkContent />
  }

  return filteredOrders?.length === 0 ? (
    <NoOrdersContent
      currentTab={currentTab}
      searchTerm={searchTerm}
      historyStatusFilter={historyStatusFilter}
      hasHydratedOrders={isHydrated}
    />
  ) : (
    <OrdersTable currentTab={currentTab} />
  )
}
