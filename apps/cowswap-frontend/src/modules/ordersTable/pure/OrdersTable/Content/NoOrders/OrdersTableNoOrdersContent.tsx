import { ReactNode, useMemo, lazy, Suspense } from 'react'

import { AMOUNT_OF_ORDERS_TO_FETCH } from '@cowprotocol/common-const'
import { useTheme } from '@cowprotocol/common-hooks'
import { useIsSafeViaWc } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { useLoadMoreOrders } from 'modules/orders'
import { TabOrderTypes } from 'modules/ordersTable/state/ordersTable.types'

import { getTitle, getDescription } from './OrdersTableNoOrdersContent.utils'

import { useNoOrdersAnimation } from '../../../../hooks/useNoOrdersAnimation'
import { OrderTabId } from '../../../../state/tabs/ordersTableTabs.constants'
import { HistoryStatusFilter } from '../../../../utils/getFilteredOrders'
import * as styledEl from '../../Container/OrdersTableContainer.styled'

const Lottie = lazy(() => import('lottie-react'))

interface OrdersTableNoOrdersContentProps {
  orderType: TabOrderTypes
  currentTab: OrderTabId
  searchTerm: string
  historyStatusFilter: HistoryStatusFilter
  hasHydratedOrders: boolean
  hasOrders: boolean
}

export function OrdersTableNoOrdersContent({
  orderType,
  currentTab,
  searchTerm,
  historyStatusFilter,
  hasHydratedOrders,
  hasOrders,
}: OrdersTableNoOrdersContentProps): ReactNode {
  const { darkMode: isDarkMode } = useTheme()
  const isSafeViaWc = useIsSafeViaWc()
  const injectedWidgetParams = useInjectedWidgetParams()
  const emptyOrdersImage = injectedWidgetParams?.images?.emptyOrders
  const animationData = useNoOrdersAnimation({ emptyOrdersImage, hasHydratedOrders, isDarkMode })
  const { t } = useLingui()
  const { limit, isLoading, hasMoreOrders } = useLoadMoreOrders()
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
      }),
    }),
    [currentTab, hasOrders, displayLimit, hasMoreOrders, orderType, searchTerm, historyStatusFilter, isSafeViaWc],
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
