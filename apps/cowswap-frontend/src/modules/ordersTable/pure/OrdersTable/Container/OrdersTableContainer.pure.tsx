import { useAtomValue } from 'jotai'
import { PropsWithChildren, ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { OrderTabId, TabOrderTypes } from 'entities/routes/routes.atom'

import { ProtocolFeeInfoBanner } from 'modules/limitOrders'
import { ordersTableFiltersAtom } from 'modules/ordersTable'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import * as styledEl from './OrdersTableContainer.styled'

import { useShouldDisplayProtocolFeeBanner } from '../../../hooks/useShouldDisplayProtocolFeeBanner'
import { ordersTableTabIdAtom } from '../../../state/params/ordersTableParams.atom'
import { OrdersTabs } from '../../OrdersTabs/OrdersTabs.pure'
import { OrdersTableContent } from '../Content/OrdersTableContent.pure'

export interface OrdersTableContainerProps extends PropsWithChildren {
  orderType: TabOrderTypes
}

export function OrdersTableContainer({ orderType, children }: OrdersTableContainerProps): ReactNode {
  const { account } = useWalletInfo()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const shouldDisplayProtocolFeeBanner = useShouldDisplayProtocolFeeBanner()

  const { searchTerm, historyStatusFilter } = useAtomValue(ordersTableFiltersAtom)
  const currentTabId = useAtomValue(ordersTableTabIdAtom)

  return (
    <styledEl.Wrapper>
      {!account || isProviderNetworkUnsupported ? null : (
        <>
          <styledEl.TopContainer>
            <styledEl.TabsContainer>
              <OrdersTabs />
              {children && (
                <styledEl.RightContainer $isHistoryTab={currentTabId === OrderTabId.HISTORY}>
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

      <OrdersTableContent orderType={orderType} searchTerm={searchTerm} historyStatusFilter={historyStatusFilter} />
    </styledEl.Wrapper>
  )
}
