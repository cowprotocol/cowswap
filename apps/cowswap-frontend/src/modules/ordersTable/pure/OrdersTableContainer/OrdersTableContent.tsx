import { ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

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
}

export function OrdersTableContent({ searchTerm, showOnlyFilled, currentTab }: OrdersTableContentProps): ReactNode {
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

  if (filteredOrders?.length === 0) {
    return (
      <NoOrdersContent
        currentTab={currentTab}
        searchTerm={searchTerm}
        showOnlyFilled={showOnlyFilled}
        hasHydratedOrders={isHydrated}
      />
    )
  }

  return <OrdersTable currentTab={currentTab} />
}
