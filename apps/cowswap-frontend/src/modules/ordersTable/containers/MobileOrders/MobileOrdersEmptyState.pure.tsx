import { ReactNode } from 'react'

import { CowSwapSafeAppLink } from '@cowprotocol/ui'
import { useIsSafeViaWc } from '@cowprotocol/wallet'

import { Trans, useLingui } from '@lingui/react/macro'
import { OrderTabId, TabOrderTypes } from 'entities/routes/routes.atom'
import { FileText } from 'react-feather'

import * as styledEl from './MobileOrders.styled'

import { LoadMoreOrdersSection } from '../../pure/OrdersTable/LoadMore/Section/LoadMoreOrdersSection'

export interface MobileOrdersEmptyStateProps {
  currentTab: OrderTabId | null
  orderType: TabOrderTypes
  hasOrders: boolean
  hasActiveFilters: boolean
  onClose(): void
  onResetFilters(): void
}

export function MobileOrdersEmptyState({
  currentTab,
  orderType,
  hasOrders,
  hasActiveFilters,
  onClose,
  onResetFilters,
}: MobileOrdersEmptyStateProps): ReactNode {
  const { t } = useLingui()
  const isSafeViaWc = useIsSafeViaWc()
  const isOpenTab = currentTab === OrderTabId.OPEN
  const isFilteredEmpty = hasOrders && hasActiveFilters
  const shouldUseSafeApp = !isFilteredEmpty && orderType === TabOrderTypes.ADVANCED && isSafeViaWc

  const title = isFilteredEmpty ? t`No matching orders` : isOpenTab ? t`No open orders` : t`No order history`
  const description = shouldUseSafeApp ? (
    <Trans>
      Use the <CowSwapSafeAppLink /> to see your orders
    </Trans>
  ) : isFilteredEmpty ? (
    t`Try adjusting your search or filters.`
  ) : isOpenTab ? (
    t`Open orders appear here with their live status and next action.`
  ) : (
    t`Completed and expired orders will appear here.`
  )

  return (
    <styledEl.EmptyState>
      <styledEl.EmptyIcon aria-hidden>
        <FileText size={28} />
      </styledEl.EmptyIcon>
      <h3>{title}</h3>
      <p>{description}</p>

      {isFilteredEmpty ? (
        <styledEl.EmptyAction onClick={onResetFilters}>{t`Reset filters`}</styledEl.EmptyAction>
      ) : isOpenTab && !shouldUseSafeApp ? (
        <styledEl.EmptyAction onClick={onClose}>{t`Start new trade`}</styledEl.EmptyAction>
      ) : null}

      {isOpenTab && !shouldUseSafeApp ? (
        <styledEl.EmptyLoadMore>
          <LoadMoreOrdersSection totalOpenOrders={0} orderType={orderType} />
        </styledEl.EmptyLoadMore>
      ) : null}
    </styledEl.EmptyState>
  )
}
