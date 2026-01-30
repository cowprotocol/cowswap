import React from 'react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'
import { CowSwapSafeAppLink } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'

import { TabOrderTypes } from '../../../../state/ordersTable.types'
import { OrderTabId } from '../../../../state/tabs/ordersTableTabs.constants'
import { HistoryStatusFilter } from '../../../../state/useFilteredOrders'
import * as styledEl from '../../Container/OrdersTableContainer.styled'
import { LoadMoreOrdersButton } from '../../LoadMore/Button/LoadMoreOrdersButton'

export interface GetTitleOptions {
  currentTab: OrderTabId
  hasOrders: boolean
  limit: number
  hasMoreOrders: boolean
  orderType?: TabOrderTypes
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
}

export function getTitle({
  currentTab,
  hasOrders,
  limit,
  hasMoreOrders,
  orderType,
  searchTerm,
  historyStatusFilter,
}: GetTitleOptions): string {
  if (currentTab === OrderTabId.unfillable) return t`No unfillable orders`

  if (currentTab === OrderTabId.open) {
    return hasMoreOrders && orderType === TabOrderTypes.LIMIT
      ? t`No open orders found in your last ${limit} orders`
      : t`No open orders found`
  }

  if (currentTab === OrderTabId.signing) return t`No signing orders`

  if (!hasOrders || (!searchTerm && historyStatusFilter === HistoryStatusFilter.ALL)) return t`No order history`

  // These only appear in the History tab when using the search or the status filter:

  if (historyStatusFilter === HistoryStatusFilter.FILLED) return t`No filled orders found`
  if (historyStatusFilter === HistoryStatusFilter.CANCELLED) return t`No cancelled orders found`
  if (historyStatusFilter === HistoryStatusFilter.EXPIRED) return t`No expired orders found`

  return t`No matching orders found`
}

export interface GetDescriptionOptions {
  currentTab: OrderTabId
  hasOrders: boolean
  limit: number
  hasMoreOrders: boolean
  orderType?: TabOrderTypes
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
  isSafeViaWc?: boolean
  displayOrdersOnlyForSafeApp?: boolean
}

export function getDescription({
  currentTab,
  hasOrders,
  limit,
  hasMoreOrders,
  orderType,
  searchTerm,
  historyStatusFilter,
  isSafeViaWc,
  displayOrdersOnlyForSafeApp,
}: GetDescriptionOptions): React.ReactNode[] {
  const areOrdersFiltered = hasOrders && (searchTerm || historyStatusFilter !== HistoryStatusFilter.ALL)

  if (!areOrdersFiltered && displayOrdersOnlyForSafeApp && isSafeViaWc) {
    const currentTabText = currentTab === OrderTabId.history ? t`orders history` : t`your orders`

    return [
      <Trans>
        Use the <CowSwapSafeAppLink /> to see {currentTabText}
      </Trans>,
    ]
  }

  if (currentTab === OrderTabId.open) {
    const learnMoreLink =
      orderType === TabOrderTypes.LIMIT ? (
        <styledEl.ExternalLinkStyled href="https://cow.fi/learn/limit-orders-explained">
          <Trans>Learn more</Trans>
          <styledEl.ExternalArrow />
        </styledEl.ExternalLinkStyled>
      ) : null

    if (hasMoreOrders && orderType === TabOrderTypes.LIMIT) {
      return [
        limit === AMOUNT_OF_ORDERS_TO_FETCH
          ? t`Only the ${limit} most recent orders were searched.`
          : t`No open orders found in the ${limit} most recent one.`,
        <>
          <Trans>Press the button below to search older orders, or create a new one!</Trans> {learnMoreLink}
        </>,
        <LoadMoreOrdersButton />,
      ]
    }

    return [
      t`You don't have any open orders at the moment.`,
      <>
        <Trans>Time to create a new one!</Trans> {learnMoreLink}
      </>,
    ]
  }

  if (!hasOrders) {
    // Generic message if there are no orders because Signing and Unfillable won't appear if there are no orders, and
    // Open is handled above, so this will only show up in History for accounts with 0 orders.
    return [t`You don't have any orders at the moment.`]
  }

  // If there are orders, then we are seeing NoOrdersContent because they have been filtered out by the searchTerm and/or historyStatusFilter:

  if (searchTerm) {
    return [
      historyStatusFilter !== HistoryStatusFilter.ALL
        ? t`Try adjusting your search term or filters`
        : t`Try adjusting your search term`,
    ]
  }

  return [t`Try adjusting your filters`]
}
