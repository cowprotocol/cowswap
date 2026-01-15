import { ReactNode } from 'react'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { useWalletInfo } from '@cowprotocol/wallet'

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

export function OrdersTableContent({
  searchTerm,
  showOnlyFilled,
  currentTab,
}: OrdersTableContentProps): ReactNode {
  const { filteredOrders, hasHydratedOrders } = useOrdersTableState() || {}
  const isHydrated = !!hasHydratedOrders
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const { account } = useWalletInfo()

  // TODO: If isProviderNetworkUnsupported === true, then isWalletConnected === true even if connected. Should this be the case?

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
