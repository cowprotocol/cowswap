import { useAtomValue } from 'jotai'
import { ReactNode, useState } from 'react'

import { CloseIconButton } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { OrderTabId, TabOrderTypes } from 'entities/routes/routes.atom'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { FiltersButton } from './FiltersButton.pure'
import * as styledEl from './MobileOrders.styled'
import { MobileOrdersContent } from './MobileOrdersContent.pure'
import { MobileOrdersFilterSheet } from './MobileOrdersFilterSheet.pure'

import { OrdersTableNoWalletContent } from '../../pure/OrdersTable/Content/NoWallet/OrdersTableNoWalletContent'
import { OrdersTableUnsupportedNetworkContent } from '../../pure/OrdersTable/Content/UnsupportedNetwork/OrdersTableUnsupportedNetworkContent'
import { ordersTableTabsAndCurrentTabAtom } from '../../state/params/ordersTableParams.atom'
import { HistoryStatusFilter } from '../../utils/getFilteredOrders'

export interface MobileOrdersProps {
  orderType: TabOrderTypes
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
  onApplyFilters(searchTerm: string, historyStatusFilter: HistoryStatusFilter): void
  onResetFilters(): void
  onClose(): void
}

export function MobileOrders({
  orderType,
  searchTerm,
  historyStatusFilter,
  onApplyFilters,
  onResetFilters,
  onClose,
}: MobileOrdersProps): ReactNode {
  const { i18n, t } = useLingui()
  const { account } = useWalletInfo()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const { tabs, tabId: currentTab } = useAtomValue(ordersTableTabsAndCurrentTabAtom)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [showHeaderFilter, setShowHeaderFilter] = useState(false)
  const title = orderType === TabOrderTypes.ADVANCED ? t`TWAP orders` : t`Limit orders`
  const currentTabData = tabs.find((tab) => tab.id === currentTab)
  const currentTabCount = currentTabData?.count
  const currentTabLabel =
    currentTabData && currentTabCount !== undefined
      ? currentTabData.id === OrderTabId.OPEN
        ? t`Open (${currentTabCount})`
        : currentTabData.id === OrderTabId.HISTORY
          ? t`History (${currentTabCount})`
          : `${i18n._(currentTabData.title)} (${currentTabCount})`
      : null
  const activeFilterCount =
    Number(searchTerm.trim().length > 0) +
    Number(currentTab === OrderTabId.HISTORY && historyStatusFilter !== HistoryStatusFilter.ALL)
  const hasActiveFilters = activeFilterCount > 0

  return (
    <styledEl.Wrapper>
      <styledEl.Header>
        <styledEl.HeaderInner>
          <styledEl.HeaderIdentity>
            <h2>{title}</h2>
            {showHeaderFilter && currentTabLabel ? (
              <styledEl.HeaderContext>{currentTabLabel}</styledEl.HeaderContext>
            ) : null}
          </styledEl.HeaderIdentity>

          <styledEl.HeaderActions>
            {showHeaderFilter && account && !isProviderNetworkUnsupported ? (
              <FiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />
            ) : null}

            <CloseIconButton closeOnEscape={false} aria-label={t`Close orders`} onClick={onClose} />
          </styledEl.HeaderActions>
        </styledEl.HeaderInner>
      </styledEl.Header>

      <styledEl.Main>
        {!account ? (
          <OrdersTableNoWalletContent />
        ) : isProviderNetworkUnsupported ? (
          <OrdersTableUnsupportedNetworkContent />
        ) : (
          <MobileOrdersContent
            orderType={orderType}
            activeFilterCount={activeFilterCount}
            hasActiveFilters={hasActiveFilters}
            onClose={onClose}
            onHeaderFilterVisibilityChange={setShowHeaderFilter}
            onOpenFilters={() => setIsFiltersOpen(true)}
            onResetFilters={onResetFilters}
          />
        )}
      </styledEl.Main>

      <MobileOrdersFilterSheet
        isOpen={isFiltersOpen}
        searchTerm={searchTerm}
        historyStatusFilter={historyStatusFilter}
        onOpenChange={setIsFiltersOpen}
        onApply={onApplyFilters}
      />
    </styledEl.Wrapper>
  )
}
