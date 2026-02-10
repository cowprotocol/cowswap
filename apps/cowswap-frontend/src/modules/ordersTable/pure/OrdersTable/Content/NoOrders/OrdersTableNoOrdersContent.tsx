import { ReactNode, useMemo, lazy, Suspense } from 'react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'

import { useLingui } from '@lingui/react/macro'

import { useLoadMoreOrders } from 'modules/orders/hooks/useLoadMoreOrders'

import { getTitle, getDescription } from './OrdersTableNoOrdersContent.utils'

import { HistoryStatusFilter } from '../../../../hooks/useFilteredOrders'
import { useNoOrdersAnimation } from '../../../../hooks/useNoOrdersAnimation'
import { useOrdersTableState } from '../../../../hooks/useOrdersTableState'
import { OrderTabId } from '../../../../state/tabs/ordersTableTabs.constants'
import * as styledEl from '../../Container/OrdersTableContainer.styled'

const Lottie = lazy(() => import('lottie-react'))

interface OrdersTableNoOrdersContentProps {
  currentTab: OrderTabId
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
  hasHydratedOrders: boolean
}

export function OrdersTableNoOrdersContent({
  currentTab,
  searchTerm,
  historyStatusFilter,
  hasHydratedOrders,
}: OrdersTableNoOrdersContentProps): ReactNode {
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
  const { limit, isLoading, hasMoreOrders } = useLoadMoreOrders()
  const hasOrders = orders.length > 0
  const displayLimit = isLoading ? limit - AMOUNT_OF_ORDERS_TO_FETCH : limit

  const { title, description } = useMemo(
    () => ({
      title: getTitle({
        currentTab,
        hasOrders,
        limit: displayLimit,
        hasMoreOrders,
        orderType,
        searchTerm,
        historyStatusFilter,
      }),
      description: getDescription({
        currentTab,
        hasOrders,
        limit: displayLimit,
        hasMoreOrders,
        orderType,
        searchTerm,
        historyStatusFilter,
        isSafeViaWc,
        displayOrdersOnlyForSafeApp,
      }),
    }),
    [
      currentTab,
      hasOrders,
      displayLimit,
      hasMoreOrders,
      orderType,
      searchTerm,
      historyStatusFilter,
      isSafeViaWc,
      displayOrdersOnlyForSafeApp,
    ],
  )

  return (
    <styledEl.Content>
      <h3>{title}</h3>

      <styledEl.ContentDescription>
        {description.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </styledEl.ContentDescription>

      <styledEl.NoOrdersAnimation>
        {emptyOrdersImage ? (
          <img src={emptyOrdersImage} alt={t`There are no orders`} />
        ) : animationData ? (
          <styledEl.NoOrdersLottieFrame aria-label={t`Animated cow reacts to empty order list`}>
            {/* TODO: what fallback should be used here? */}
            <Suspense fallback={null}>
              <Lottie animationData={animationData} loop autoplay />
            </Suspense>
          </styledEl.NoOrdersLottieFrame>
        ) : (
          <styledEl.NoOrdersLottieFrame aria-hidden="true" />
        )}
      </styledEl.NoOrdersAnimation>
    </styledEl.Content>
  )
}
