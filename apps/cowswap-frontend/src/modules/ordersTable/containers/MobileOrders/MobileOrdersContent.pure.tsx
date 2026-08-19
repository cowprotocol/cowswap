import { useAtomValue } from 'jotai'
import { ReactNode, useEffect, useLayoutEffect, useRef } from 'react'

import { useLingui } from '@lingui/react/macro'
import { OrderTabId, TabOrderTypes } from 'entities/routes/routes.atom'

import { ProtocolFeeInfoBanner } from 'modules/limitOrders'

import { FiltersButton } from './FiltersButton.pure'
import * as styledEl from './MobileOrders.styled'
import { MobileOrdersList } from './MobileOrdersList.pure'

import { useGetBuildOrdersTableUrl } from '../../hooks/url/useGetBuildOrdersTableUrl'
import { useShouldDisplayProtocolFeeBanner } from '../../hooks/useShouldDisplayProtocolFeeBanner'
import {
  ordersTablePageAtom,
  ordersTableTabIdAtom,
  ordersTableTabsAtom,
} from '../../state/params/ordersTableParams.atom'

export interface MobileOrdersContentProps {
  orderType: TabOrderTypes
  activeFilterCount: number
  hasActiveFilters: boolean
  onClose(): void
  onHeaderFilterVisibilityChange(visible: boolean): void
  onOpenFilters(): void
  onResetFilters(): void
}

export function MobileOrdersContent({
  orderType,
  activeFilterCount,
  hasActiveFilters,
  onClose,
  onHeaderFilterVisibilityChange,
  onOpenFilters,
  onResetFilters,
}: MobileOrdersContentProps): ReactNode {
  const { i18n, t } = useLingui()
  const tabs = useAtomValue(ordersTableTabsAtom)
  const currentTab = useAtomValue(ordersTableTabIdAtom)
  const currentPage = useAtomValue(ordersTablePageAtom) ?? 1
  const shouldDisplayProtocolFeeBanner = useShouldDisplayProtocolFeeBanner()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()
  const tabRailRef = useRef<HTMLDivElement>(null)
  const previousPageRef = useRef(currentPage)

  useLayoutEffect(() => {
    if (previousPageRef.current === currentPage) return

    previousPageRef.current = currentPage

    const drawerContent = tabRailRef.current?.closest<HTMLElement>('[data-drawer-content]')

    if (drawerContent) {
      drawerContent.scrollTop = 0
    }
  }, [currentPage])

  useEffect(() => {
    const tabRail = tabRailRef.current

    if (!tabRail || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        onHeaderFilterVisibilityChange(entry ? !entry.isIntersecting : false)
      },
      { rootMargin: '-64px 0px 0px 0px', threshold: 0 },
    )

    observer.observe(tabRail)

    return () => observer.disconnect()
  }, [onHeaderFilterVisibilityChange])

  return (
    <>
      <styledEl.TabRail ref={tabRailRef}>
        <styledEl.Tabs role="tablist" aria-label={t`Order lists`}>
          {tabs.map((tab) => {
            const count = tab.count

            return (
              <styledEl.Tab
                key={tab.id}
                role="tab"
                aria-selected={tab.id === currentTab}
                $isActive={tab.id === currentTab}
                to={buildOrdersTableUrl({ tabId: tab.id, pageNumber: 1 })}
              >
                {tab.id === OrderTabId.OPEN
                  ? t`Open (${count})`
                  : tab.id === OrderTabId.HISTORY
                    ? t`History (${count})`
                    : `${i18n._(tab.title)} (${count})`}
              </styledEl.Tab>
            )
          })}
        </styledEl.Tabs>

        <styledEl.FilterHitArea>
          <FiltersButton activeCount={activeFilterCount} onClick={onOpenFilters} />
        </styledEl.FilterHitArea>
      </styledEl.TabRail>

      {shouldDisplayProtocolFeeBanner ? (
        <styledEl.Banner>
          <ProtocolFeeInfoBanner margin="0" />
        </styledEl.Banner>
      ) : null}

      <MobileOrdersList
        orderType={orderType}
        hasActiveFilters={hasActiveFilters}
        onClose={onClose}
        onResetFilters={onResetFilters}
      />
    </>
  )
}
