import { ReactNode, memo } from 'react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import { CowSwapSafeAppLink } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'
import Lottie from 'lottie-react'

import { useLoadMoreOrders } from 'modules/orders/hooks/useLoadMoreOrders'
import { HistoryStatusFilter } from 'modules/ordersTable/hooks/useFilteredOrders'
import { LoadMoreOrdersButton } from 'modules/ordersTable/pure/OrdersTableContainer/LoadMoreOrdersButton'

import * as styledEl from './OrdersTableContainer.styled'

import { OrderTabId } from '../../const/tabs'
import { useNoOrdersAnimation } from '../../hooks/useNoOrdersAnimation'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { TabOrderTypes } from '../../types'

interface NoOrdersDescriptionProps {
  currentTab: OrderTabId
  hasOrders: boolean
  orderType?: TabOrderTypes
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
  isSafeViaWc?: boolean
  displayOrdersOnlyForSafeApp?: boolean
}

const NoOrdersDescription = memo(function NoOrdersDescription({
  currentTab,
  hasOrders,
  orderType,
  searchTerm,
  historyStatusFilter,
  isSafeViaWc,
  displayOrdersOnlyForSafeApp,
}: NoOrdersDescriptionProps): ReactNode {
  const { t } = useLingui()
  const { limit, hasMoreOrders } = useLoadMoreOrders()
  const currentTabText = currentTab === OrderTabId.history ? t`orders history` : t`your orders`
  const orderStatusText =
    currentTab === OrderTabId.unfillable ? t`unfillable` : currentTab === OrderTabId.open ? t`open` : ''

  if (displayOrdersOnlyForSafeApp && isSafeViaWc) {
    return (
      <p>
        <Trans>
          Use the <CowSwapSafeAppLink /> to see {currentTabText}
        </Trans>
      </p>
    )
  }

  if (currentTab === OrderTabId.open) {
    // TODO: Add No more orders to search message...

    return hasMoreOrders ? (
      <styledEl.ContentDescription>
        <p>
          {limit === AMOUNT_OF_ORDERS_TO_FETCH ? (
            <Trans>Only the {limit} most recent orders were searched.</Trans>
          ) : (
            <Trans>No open orders found in the {limit} most recent one.</Trans>
          )}
        </p>
        <p>
          <Trans>Press the button below to search older orders, or create a new one!</Trans>{' '}
          {orderType === TabOrderTypes.LIMIT ? (
            <styledEl.ExternalLinkStyled href="https://cow.fi/learn/limit-orders-explained">
              <Trans>Learn more</Trans>
              <styledEl.ExternalArrow />
            </styledEl.ExternalLinkStyled>
          ) : null}
        </p>

        <p>
          <LoadMoreOrdersButton />
        </p>
      </styledEl.ContentDescription>
    ) : (
      <styledEl.ContentDescription>
        <p>
          <Trans>You don't have any open orders at the moment.</Trans>
        </p>
        <p>
          <Trans>Time to create a new one!</Trans>{' '}
          {orderType === TabOrderTypes.LIMIT ? (
            <styledEl.ExternalLinkStyled href="https://cow.fi/learn/limit-orders-explained">
              <Trans>Learn more</Trans>
              <styledEl.ExternalArrow />
            </styledEl.ExternalLinkStyled>
          ) : null}
        </p>
      </styledEl.ContentDescription>
    )
  }

  if (!hasOrders) {
    return (
      <>
        <Trans>You don't have any {orderStatusText} orders at the moment.</Trans>
      </>
    )
  }

  if (searchTerm && historyStatusFilter !== HistoryStatusFilter.ALL)
    return <Trans>Try adjusting your search term or filters</Trans>

  return searchTerm ? <Trans>Try adjusting your search term</Trans> : <Trans>Try adjusting your filters</Trans>
})

function getTabTitle(currentTab: OrderTabId, limit: number, hasMoreOrders: boolean): string {
  if (currentTab === OrderTabId.unfillable) return t`No unfillable orders`
  if (currentTab === OrderTabId.open)
    return hasMoreOrders ? t`No open orders found in your last ${limit} orders` : t`No open orders found`
  if (currentTab === OrderTabId.signing) return t`No signing orders`
  return t`No order history`
}

function getHistoryTitle(historyStatusFilter: HistoryStatusFilter): string {
  if (historyStatusFilter === HistoryStatusFilter.FILLED) return t`No filled orders found`
  if (historyStatusFilter === HistoryStatusFilter.CANCELLED) return t`No cancelled orders found`
  if (historyStatusFilter === HistoryStatusFilter.EXPIRED) return t`No expired orders found`

  return t`No matching orders found`
}

interface NoOrdersContentProps {
  currentTab: OrderTabId
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
  hasHydratedOrders: boolean
}

export function NoOrdersContent({
  currentTab,
  searchTerm,
  historyStatusFilter,
  hasHydratedOrders,
}: NoOrdersContentProps): ReactNode {
  const { darkMode: isDarkMode } = useTheme()
  const {
    orderType,
    isSafeViaWc,
    displayOrdersOnlyForSafeApp,
    injectedWidgetParams,
    orders = [],
  } = useOrdersTableState() || {}
  const emptyOrdersImage = injectedWidgetParams?.images?.emptyOrders
  const animationData = useNoOrdersAnimation({ emptyOrdersImage, hasHydratedOrders, isDarkMode })
  const { t } = useLingui()
  const { limit, hasMoreOrders } = useLoadMoreOrders()
  const hasOrders = orders.length > 0

  console.log(hasOrders)

  return (
    <styledEl.Content>
      <h3>
        {hasOrders &&
        (searchTerm || historyStatusFilter !== HistoryStatusFilter.ALL) &&
        currentTab === OrderTabId.history
          ? getHistoryTitle(historyStatusFilter)
          : getTabTitle(currentTab, limit, hasMoreOrders)}
      </h3>

      <NoOrdersDescription
        currentTab={currentTab}
        hasOrders={hasOrders}
        orderType={orderType}
        searchTerm={searchTerm}
        historyStatusFilter={historyStatusFilter}
        isSafeViaWc={isSafeViaWc}
        displayOrdersOnlyForSafeApp={displayOrdersOnlyForSafeApp}
      />

      <styledEl.NoOrdersAnimation>
        {emptyOrdersImage ? (
          <img src={emptyOrdersImage} alt={t`There are no orders`} />
        ) : animationData ? (
          <styledEl.NoOrdersLottieFrame aria-label={t`Animated cow reacts to empty order list`}>
            <Lottie animationData={animationData} loop autoplay />
          </styledEl.NoOrdersLottieFrame>
        ) : (
          <styledEl.NoOrdersLottieFrame aria-hidden="true" />
        )}
      </styledEl.NoOrdersAnimation>
    </styledEl.Content>
  )
}
