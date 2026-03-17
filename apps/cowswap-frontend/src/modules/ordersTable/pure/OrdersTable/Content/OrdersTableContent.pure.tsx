import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { locationOrderTypeAtom, OrderTabId } from 'common/state/routesState'

import { OrdersTableNoOrdersContent } from './NoOrders/OrdersTableNoOrdersContent'
import { OrdersTableNoWalletContent } from './NoWallet/OrdersTableNoWalletContent'
import { OrdersTableUnsupportedNetworkContent } from './UnsupportedNetwork/OrdersTableUnsupportedNetworkContent'

import { ordersTableStateAtom } from '../../../state/ordersTable.atoms'
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
  const orderType = useAtomValue(locationOrderTypeAtom)
  const { orders, filteredOrders, hasHydratedOrders } = useAtomValue(ordersTableStateAtom)
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
      hasOrders={!!orders?.length}
    />
  ) : (
    <OrdersTable currentTab={currentTab} />
  )
}
