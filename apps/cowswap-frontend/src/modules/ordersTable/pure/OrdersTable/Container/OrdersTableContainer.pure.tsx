import { PropsWithChildren, ReactNode, useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { ProtocolFeeInfoBanner } from 'modules/limitOrders'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import * as styledEl from './OrdersTableContainer.styled'

import { HistoryStatusFilter } from '../../../hooks/useFilteredOrders'
import { useOrdersTableState } from '../../../hooks/useOrdersTableState'
import { useShouldDisplayProtocolFeeBanner } from '../../../hooks/useShouldDisplayProtocolFeeBanner'
import { OrderTabId } from '../../../state/tabs/ordersTableTabs.constants'
import { OrdersTabs } from '../../OrdersTabs/OrdersTabs.pure'
import { OrdersTableContent } from '../Content/OrdersTableContent.pure'
import { useOrdersTableFilters, useOrdersTableTabs } from 'modules/ordersTable/hooks/useOrdersTableFilters'

export function OrdersTableContainer({
  children,
}: PropsWithChildren): ReactNode {
  const { account } = useWalletInfo()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const shouldDisplayProtocolFeeBanner = useShouldDisplayProtocolFeeBanner()

  const {
    currentTabId,
    searchTerm,
    historyStatusFilter,
  } = useOrdersTableFilters() || {}

  const tabs = useOrdersTableTabs()

  console.log("tabs =", tabs);

  /*
  TODO: Why was it done this way instead of getting currentTabId from the atom?
  const currentTab = useMemo(() => {
    const activeTab = tabs?.find((tab) => tab.isActive)
    return activeTab?.id || OrderTabId.open
  }, [tabs])
  */

  return (
    <styledEl.Wrapper>
      {!account || isProviderNetworkUnsupported ? null : (
        <>
          <styledEl.TopContainer>
            <styledEl.TabsContainer>
              {tabs && <OrdersTabs tabs={tabs} />}
              {children && (
                <styledEl.RightContainer $isHistoryTab={currentTabId === OrderTabId.history /* || OrderTabId.open */}>
                  {children}
                </styledEl.RightContainer>
              )}
            </styledEl.TabsContainer>
          </styledEl.TopContainer>

          {shouldDisplayProtocolFeeBanner && (
            <styledEl.BannerContainer>
              <ProtocolFeeInfoBanner margin="0" />
            </styledEl.BannerContainer>
          )}
        </>
      )}

      <OrdersTableContent
        currentTab={currentTabId}
        searchTerm={searchTerm}
        historyStatusFilter={historyStatusFilter} />
    </styledEl.Wrapper>
  )
}
