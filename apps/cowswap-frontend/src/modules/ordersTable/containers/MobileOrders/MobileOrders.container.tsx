import { useAtomValue } from 'jotai'
import { ReactNode, RefObject, useLayoutEffect, useRef, useState } from 'react'

import { Modal, ModalHeader } from '@cowprotocol/ui'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { OrderTabId, TabOrderTypes } from 'entities/routes/routes.atom'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { FiltersButton } from './FiltersButton.pure'
import { MobileOrdersContent } from './MobileOrdersContent.pure'
import { MobileOrdersFilterSheet } from './MobileOrdersFilterSheet.pure'
import { MobileOrdersTabRail } from './MobileOrdersTabRail.pure'

import { OrdersTableNoWalletContent } from '../../pure/OrdersTable/Content/NoWallet/OrdersTableNoWalletContent'
import { OrdersTableUnsupportedNetworkContent } from '../../pure/OrdersTable/Content/UnsupportedNetwork/OrdersTableUnsupportedNetworkContent'
import {
  ordersTablePageAtom,
  ordersTableTabIdAtom,
  ordersTableTabsAtom,
} from '../../state/params/ordersTableParams.atom'
import { HistoryStatusFilter } from '../../utils/getFilteredOrders'

const OVERLAY_SCROLL_ROOT_SELECTOR = '[data-modal-root], [data-drawer-content]'

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
  const tabs = useAtomValue(ordersTableTabsAtom)
  const currentTab = useAtomValue(ordersTableTabIdAtom)
  const [isFiltersOpen, setIsFiltersOpen] = useState(false)
  const [showHeaderFilter, setShowHeaderFilter] = useState(false)
  const tabRailRef = useRef<HTMLDivElement>(null)
  const canShowOrders = Boolean(account) && !isProviderNetworkUnsupported
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

  useResetOverlayScrollOnPageChange(tabRailRef)

  return (
    <>
      <ModalHeader
        sticky
        bottomBorder
        contentMargin
        title={title}
        subtitle={currentTabLabel}
        hideSubtitle={!showHeaderFilter}
        rightSlot={<FiltersButton activeCount={activeFilterCount} onClick={() => setIsFiltersOpen(true)} />}
        hideRightSlot={!showHeaderFilter || !canShowOrders}
        scrollableBottomSlot={
          canShowOrders ? (
            <MobileOrdersTabRail
              tabs={tabs}
              currentTab={currentTab}
              activeFilterCount={activeFilterCount}
              tabRailRef={tabRailRef}
              onOpenFilters={() => setIsFiltersOpen(true)}
            />
          ) : null
        }
        onScrollableBottomVisibilityChange={(visible) => setShowHeaderFilter(!visible)}
        onClose={onClose}
      />

      <Modal.Content>
        {!account ? (
          <OrdersTableNoWalletContent />
        ) : isProviderNetworkUnsupported ? (
          <OrdersTableUnsupportedNetworkContent />
        ) : (
          <MobileOrdersContent
            orderType={orderType}
            hasActiveFilters={hasActiveFilters}
            onClose={onClose}
            onResetFilters={onResetFilters}
          />
        )}
      </Modal.Content>

      <MobileOrdersFilterSheet
        isOpen={isFiltersOpen}
        searchTerm={searchTerm}
        historyStatusFilter={historyStatusFilter}
        onOpenChange={setIsFiltersOpen}
        onApply={onApplyFilters}
      />
    </>
  )
}

function useResetOverlayScrollOnPageChange(elementRef: RefObject<HTMLElement | null>): void {
  const currentPage = useAtomValue(ordersTablePageAtom) ?? 1
  const previousPageRef = useRef(currentPage)

  useLayoutEffect(() => {
    if (previousPageRef.current === currentPage) return

    previousPageRef.current = currentPage

    const scrollRoot = elementRef.current?.closest<HTMLElement>(OVERLAY_SCROLL_ROOT_SELECTOR)

    if (scrollRoot) {
      scrollRoot.scrollTop = 0
    }
  }, [currentPage, elementRef])
}
