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

interface OrdersTableContainerProps extends PropsWithChildren {
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
}

export function OrdersTableContainer({
  searchTerm,
  historyStatusFilter,
  children,
}: OrdersTableContainerProps): ReactNode {
  const { account } = useWalletInfo()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const { tabs } = useOrdersTableState() || {}
  const shouldDisplayProtocolFeeBanner = useShouldDisplayProtocolFeeBanner()

  const currentTab = useMemo(() => {
    const activeTab = tabs?.find((tab) => tab.isActive)
    return activeTab?.id || OrderTabId.open
  }, [tabs])

  return (
    <styledEl.Wrapper>
      {!account || isProviderNetworkUnsupported ? null : (
        <>
          <styledEl.TopContainer>
            <styledEl.TabsContainer>
              {tabs && <OrdersTabs tabs={tabs} />}
              {children && (
                <styledEl.RightContainer $isHistoryTab={currentTab === OrderTabId.history}>
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

      <OrdersTableContent searchTerm={searchTerm} historyStatusFilter={historyStatusFilter} currentTab={currentTab} />
    </styledEl.Wrapper>
  )
}
