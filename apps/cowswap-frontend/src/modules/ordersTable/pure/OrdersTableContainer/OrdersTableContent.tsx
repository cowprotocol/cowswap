import { ReactNode, useState } from 'react'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { ConnectWalletContent } from './ConnectWalletContent'
import { NoOrdersContent } from './NoOrdersContent'
import { OrdersTable } from './OrdersTable'
import { ShowOnlyFilledOrdersFilter } from './ShowOnlyFilledOrdersFilter'
import { UnsupportedNetworkContent } from './UnsupportedNetworkContent'

import { OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { useFilteredHistoryOrders } from '../../hooks/useOdersTableFilter'

interface OrdersTableContentProps {
  currentTab: OrderTabId
  searchTerm?: string
  isDarkMode: boolean
}

export function OrdersTableContent({ searchTerm, currentTab, isDarkMode }: OrdersTableContentProps): ReactNode {
  const { filteredOrders, isWalletConnected, hasHydratedOrders } = useOrdersTableState() || {}
  const isHydrated = !!hasHydratedOrders
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const [showOnlyFilled, setShowOnlyFilled] = useState(true)

  // Apply "Show only filled orders" filter for history tab
  // Always call the hook, but only use result when needed
  const filteredHistoryOrders = useFilteredHistoryOrders(filteredOrders || [], currentTab === OrderTabId.history && showOnlyFilled)

  if (!isWalletConnected) {
    return <ConnectWalletContent />
  }

  if (isProviderNetworkUnsupported) {
    return <UnsupportedNetworkContent />
  }

  // TODO: Message in NoOrdersContent should be different if it's because of the filter.
  
  if (filteredHistoryOrders?.length === 0) {
    return (
      <>
        {currentTab === OrderTabId.history && (filteredOrders || []).length > 0 && (
          <ShowOnlyFilledOrdersFilter showOnlyFilled={showOnlyFilled} onShowOnlyFilledChange={setShowOnlyFilled} />
        )}
        <NoOrdersContent
          currentTab={currentTab}
          searchTerm={searchTerm}
          hasHydratedOrders={isHydrated}
          isDarkMode={isDarkMode}
        />
      </>
    )
  }

  return (
    <>
      {currentTab === OrderTabId.history && (
        <ShowOnlyFilledOrdersFilter showOnlyFilled={showOnlyFilled} onShowOnlyFilledChange={setShowOnlyFilled} />
      )}
      <OrdersTable currentTab={currentTab} filteredOrdersOverride={filteredHistoryOrders} />
    </>
  )
}
