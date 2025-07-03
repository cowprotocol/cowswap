import { ReactNode, useMemo } from 'react'

import * as styledEl from './OrdersTableContainer.styled'
import { OrdersTableContent } from './OrdersTableContent'
import { OrdersTabs } from './OrdersTabs'

import { OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'

interface OrdersTableContainerProps {
  searchTerm?: string
  children: ReactNode
}

export function OrdersTableContainer({ searchTerm, children }: OrdersTableContainerProps): ReactNode {
  const { tabs, isWalletConnected } = useOrdersTableState() || {}

  const currentTab = useMemo(() => {
    const activeTab = tabs?.find((tab) => tab.isActive)
    return activeTab?.id || OrderTabId.all
  }, [tabs])

  return (
    <styledEl.Wrapper>
      <styledEl.TopContainer>
        <styledEl.TabsContainer>
          {tabs && <OrdersTabs tabs={tabs} isWalletConnected={!!isWalletConnected} />}
          {children && <styledEl.RightContainer>{children}</styledEl.RightContainer>}
        </styledEl.TabsContainer>
      </styledEl.TopContainer>
      <OrdersTableContent searchTerm={searchTerm} currentTab={currentTab} />
    </styledEl.Wrapper>
  )
}
