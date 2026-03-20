import { useAtomValue } from 'jotai'
import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { locationOrderTypeAtom } from 'common/state/routesState'

import { OrdersTableNoOrdersContent } from './NoOrders/OrdersTableNoOrdersContent'
import { OrdersTableNoWalletContent } from './NoWallet/OrdersTableNoWalletContent'
import { OrdersTableUnsupportedNetworkContent } from './UnsupportedNetwork/OrdersTableUnsupportedNetworkContent'

import { ordersTableStateAtom } from '../../../state/ordersTable.atoms'
import { ordersTableTabIdAtom } from '../../../state/params/ordersTableParams.atom'
import { HistoryStatusFilter } from '../../../utils/getFilteredOrders'
import { OrdersTable } from '../OrdersTable.pure'

interface OrdersTableContentProps {
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
}

export function OrdersTableContent({ searchTerm, historyStatusFilter }: OrdersTableContentProps): ReactNode {
  const orderType = useAtomValue(locationOrderTypeAtom)
  const currentTabId = useAtomValue(ordersTableTabIdAtom)
  const { orders, filteredOrders, hasHydratedOrders } = useAtomValue(ordersTableStateAtom)
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
      currentTab={currentTabId}
      searchTerm={searchTerm}
      historyStatusFilter={historyStatusFilter}
      hasHydratedOrders={hasHydratedOrders}
      hasOrders={!!orders?.length}
    />
  ) : (
    <OrdersTable currentTab={currentTabId} />
  )
}
