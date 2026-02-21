import { useAtomValue } from 'jotai'
import { PropsWithChildren, ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { ProtocolFeeInfoBanner } from 'modules/limitOrders'
import { tabParamAtom } from 'modules/ordersTable/state/params/ordersTableParams.atoms'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import * as styledEl from './OrdersTableContainer.styled'

import { useShouldDisplayProtocolFeeBanner } from '../../../hooks/useShouldDisplayProtocolFeeBanner'
import { OrderTabId } from '../../../state/tabs/ordersTableTabs.constants'
import { OrdersTabs } from '../../OrdersTabs/OrdersTabs.pure'
import { OrdersTableContent } from '../Content/OrdersTableContent.pure'
import { ordersTableFiltersAtom } from 'modules/ordersTable/state/ordersTable.atoms'

export function OrdersTableContainer({ children }: PropsWithChildren): ReactNode {
  const { account } = useWalletInfo()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const shouldDisplayProtocolFeeBanner = useShouldDisplayProtocolFeeBanner()

  const { searchTerm, historyStatusFilter } = useAtomValue(ordersTableFiltersAtom)
  const currentTabId = useAtomValue(tabParamAtom)

  return (
    <styledEl.Wrapper>
      {!account || isProviderNetworkUnsupported ? null : (
        <>
          <styledEl.TopContainer>
            <styledEl.TabsContainer>
              <OrdersTabs />
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

      <OrdersTableContent currentTab={currentTabId} searchTerm={searchTerm} historyStatusFilter={historyStatusFilter} />
    </styledEl.Wrapper>
  )
}
