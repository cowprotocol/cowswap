import { ReactNode, useMemo } from 'react'

import { ProtocolFeeInfoBanner } from 'modules/limitOrders'

import * as styledEl from './OrdersTableContainer.styled'
import { OrdersTableContent } from './OrdersTableContent'
import { OrdersTabs } from './OrdersTabs'

import { OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { useShouldDisplayProtocolFeeBanner } from '../../hooks/useShouldDisplayProtocolFeeBanner'

interface OrdersTableContainerProps {
  searchTerm?: string
  showOnlyFilled?: boolean
  children: ReactNode
  isDarkMode: boolean
}

export function OrdersTableContainer({
  searchTerm,
  showOnlyFilled,
  children,
  isDarkMode,
}: OrdersTableContainerProps): ReactNode {
  const { tabs, isWalletConnected } = useOrdersTableState() || {}
  const shouldDisplayProtocolFeeBanner = useShouldDisplayProtocolFeeBanner()

  const currentTab = useMemo(() => {
    const activeTab = tabs?.find((tab) => tab.isActive)
    return activeTab?.id || OrderTabId.open
  }, [tabs])

  return (
    <styledEl.Wrapper>
      <styledEl.TopContainer>
        <styledEl.TabsContainer>
          {tabs && <OrdersTabs tabs={tabs} isWalletConnected={!!isWalletConnected} />}
          {children && <styledEl.RightContainer>{children}</styledEl.RightContainer>}
        </styledEl.TabsContainer>
      </styledEl.TopContainer>
      {shouldDisplayProtocolFeeBanner && (
        <styledEl.BannerContainer>
          <ProtocolFeeInfoBanner margin="0" />
        </styledEl.BannerContainer>
      )}
      <OrdersTableContent
        searchTerm={searchTerm}
        showOnlyFilled={showOnlyFilled}
        currentTab={currentTab}
        isDarkMode={isDarkMode}
      />
    </styledEl.Wrapper>
  )
}
