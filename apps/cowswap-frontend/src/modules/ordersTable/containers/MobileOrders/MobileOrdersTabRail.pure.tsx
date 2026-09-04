import { ReactNode, RefObject } from 'react'

import { useLingui } from '@lingui/react/macro'
import { OrderTabId } from 'entities/routes/routes.atom'

import { FiltersButton } from './FiltersButton.pure'
import * as styledEl from './MobileOrders.styled'

import { useGetBuildOrdersTableUrl } from '../../hooks/url/useGetBuildOrdersTableUrl'
import { OrderTab } from '../../state/params/ordersTableParams.constants'

export interface MobileOrdersTabRailProps {
  tabs: OrderTab[]
  currentTab: OrderTabId | null
  activeFilterCount: number
  tabRailRef: RefObject<HTMLDivElement | null>
  onOpenFilters(): void
}

export function MobileOrdersTabRail({
  tabs,
  currentTab,
  activeFilterCount,
  tabRailRef,
  onOpenFilters,
}: MobileOrdersTabRailProps): ReactNode {
  const { i18n, t } = useLingui()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()

  return (
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
  )
}
