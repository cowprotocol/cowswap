import { useAtomValue } from 'jotai'
import { PropsWithChildren, ReactNode } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import { ProtocolFeeInfoBanner } from 'modules/limitOrders'
import { ordersTableFiltersAtom } from 'modules/ordersTable'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'
import { OrderTabId } from 'common/state/routesState'

import * as styledEl from './OrdersTableContainer.styled'

import { useShouldDisplayProtocolFeeBanner } from '../../../hooks/useShouldDisplayProtocolFeeBanner'
import { ordersTableTabIdAtom } from '../../../state/params/ordersTableParams.atom'
import { OrdersTabs } from '../../OrdersTabs/OrdersTabs.pure'
import { OrdersTableContent } from '../Content/OrdersTableContent.pure'

export function OrdersTableContainer({ children }: PropsWithChildren): ReactNode {
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

      <OrdersTableContent searchTerm={searchTerm} historyStatusFilter={historyStatusFilter} />
    </styledEl.Wrapper>
  )
}
