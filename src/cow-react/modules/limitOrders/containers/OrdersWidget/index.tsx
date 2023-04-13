import { Orders } from '../../pure/Orders'
import { LimitOrdersList, ParsedOrder, useLimitOrdersList } from './hooks/useLimitOrdersList'
import { useEffect, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { OrdersReceiptModal } from '@cow/modules/limitOrders/containers/OrdersReceiptModal'
import { useBalancesAndAllowances } from '@cow/modules/tokens'
import { GP_VAULT_RELAYER } from 'constants/index'
import { buildLimitOrdersUrl, parseLimitOrdersPageParams } from '@cow/modules/limitOrders/utils/buildLimitOrdersUrl'
import { LIMIT_ORDERS_TABS, OPEN_TAB } from '@cow/modules/limitOrders/const/limitOrdersTabs'
import { useValidatePageUrlParams } from './hooks/useValidatePageUrlParams'
import { useCancelOrder } from '@cow/common/hooks/useCancelOrder'
import { useAtomValue } from 'jotai/utils'
import { pendingOrdersPricesAtom } from '@cow/modules/orders/state/pendingOrdersPricesAtom'
import { useWalletInfo } from '@cow/modules/wallet'
import { useGetSpotPrice } from '@cow/modules/orders/state/spotPricesAtom'
import { useInputTokensFromOrders } from '@cow/modules/orders'

function getOrdersListByIndex(ordersList: LimitOrdersList, id: string): ParsedOrder[] {
  return id === OPEN_TAB.id ? ordersList.pending : ordersList.history
}

export function OrdersWidget() {
  const location = useLocation()
  const navigate = useNavigate()
  const ordersList = useLimitOrdersList()
  const { chainId, account } = useWalletInfo()
  const getShowCancellationModal = useCancelOrder()
  const pendingOrdersPrices = useAtomValue(pendingOrdersPricesAtom)
  const getSpotPrice = useGetSpotPrice()

  const spender = useMemo(() => (chainId ? GP_VAULT_RELAYER[chainId] : undefined), [chainId])

  const { currentTabId, currentPageNumber } = useMemo(() => {
    const params = parseLimitOrdersPageParams(location.search)

    return {
      currentTabId: params.tabId || OPEN_TAB.id,
      currentPageNumber: params.pageNumber || 1,
    }
  }, [location.search])

  const orders = useMemo(() => {
    return getOrdersListByIndex(ordersList, currentTabId)
  }, [ordersList, currentTabId])

  const tabs = useMemo(() => {
    return LIMIT_ORDERS_TABS.map((tab) => {
      return { ...tab, isActive: tab.id === currentTabId, count: getOrdersListByIndex(ordersList, tab.id).length }
    })
  }, [currentTabId, ordersList])

  const isOpenOrdersTab = useMemo(() => OPEN_TAB.id === currentTabId, [currentTabId])

  // Get tokens from pending orders (only if the OPEN orders tab is opened)
  const tokens = useInputTokensFromOrders(isOpenOrdersTab ? ordersList.pending : [])

  // Get effective balance
  const balancesAndAllowances = useBalancesAndAllowances({ account, spender, tokens })

  // Set page params initially once
  useEffect(() => {
    navigate(buildLimitOrdersUrl(location, { pageNumber: currentPageNumber, tabId: currentTabId }), { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useValidatePageUrlParams(orders, currentTabId, currentPageNumber)

  return (
    <>
      <Orders
        chainId={chainId}
        tabs={tabs}
        orders={orders}
        isOpenOrdersTab={isOpenOrdersTab}
        currentPageNumber={currentPageNumber}
        pendingOrdersPrices={pendingOrdersPrices}
        balancesAndAllowances={balancesAndAllowances}
        isWalletConnected={!!account}
        getShowCancellationModal={getShowCancellationModal}
        getSpotPrice={getSpotPrice}
      ></Orders>
      <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />
    </>
  )
}
