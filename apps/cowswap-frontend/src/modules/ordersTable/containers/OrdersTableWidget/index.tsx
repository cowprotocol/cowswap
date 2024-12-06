import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Search } from 'react-feather'

import { useTokensAllowances, useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { useIsSafeViaWc, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { useLocation } from 'react-router-dom'
import styled from 'styled-components/macro'

import { Order } from 'legacy/state/orders/actions'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { pendingOrdersPricesAtom } from 'modules/orders/state/pendingOrdersPricesAtom'
import { useGetSpotPrice } from 'modules/orders/state/spotPricesAtom'
import { PendingPermitUpdater, useGetOrdersPermitStatus } from 'modules/permit'

import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'
import { ordersToCancelAtom, updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { useNavigate } from 'common/hooks/useNavigate'
import { CancellableOrder } from 'common/utils/isOrderCancellable'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { useGetOrdersToCheckPendingPermit } from './hooks/useGetOrdersToCheckPendingPermit'
import { OrdersTableList, useOrdersTableList } from './hooks/useOrdersTableList'
import { useOrdersTableTokenApprove } from './hooks/useOrdersTableTokenApprove'
import { useValidatePageUrlParams } from './hooks/useValidatePageUrlParams'

import { BalancesAndAllowances } from '../../../tokens'
import { OPEN_TAB, ORDERS_TABLE_TABS } from '../../const/tabs'
import { OrdersTableContainer } from '../../pure/OrdersTableContainer'
import { OrderActions } from '../../pure/OrdersTableContainer/types'
import { TabOrderTypes } from '../../types'
import { buildOrdersTableUrl } from '../../utils/buildOrdersTableUrl'
import { OrderTableItem, tableItemsToOrders, getParsedOrderFromTableItem } from '../../utils/orderTableGroupUtils'
import { parseOrdersTableUrl } from '../../utils/parseOrdersTableUrl'
import { MultipleCancellationMenu } from '../MultipleCancellationMenu'
import { OrdersReceiptModal } from '../OrdersReceiptModal'
import { useGetAlternativeOrderModalContextCallback, useSelectReceiptOrder } from '../OrdersReceiptModal/hooks'

const SearchInputContainer = styled.div`
  margin: 16px 0;
  padding: 0 16px;
  position: relative;
`

const SearchIcon = styled(Search)`
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.textSecondary};
  width: 16px;
  height: 16px;
`

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px 8px 36px;
  border: 1px solid ${({ theme }) => theme.grey};
  border-radius: 8px;
  font-size: 14px;

  &::placeholder {
    color: ${({ theme }) => theme.textSecondary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.blue};
  }
`

function getOrdersListByIndex(ordersList: OrdersTableList, id: string): OrderTableItem[] {
  return id === OPEN_TAB.id ? ordersList.pending : ordersList.history
}

function toggleOrderInCancellationList(state: CancellableOrder[], order: CancellableOrder): CancellableOrder[] {
  const isOrderIncluded = state.find((item) => item.id === order.id)

  if (isOrderIncluded) {
    return state.filter((item) => item.id !== order.id)
  }

  return [...state, order]
}

interface OrdersTableWidgetProps {
  displayOrdersOnlyForSafeApp: boolean
  orders: Order[]
  orderType: TabOrderTypes
}

export function OrdersTableWidget({
  orders: allOrders,
  orderType,
  displayOrdersOnlyForSafeApp,
}: OrdersTableWidgetProps) {
  const { chainId, account } = useWalletInfo()
  const location = useLocation()
  const navigate = useNavigate()
  const cancelOrder = useCancelOrder()
  const ordersList = useOrdersTableList(allOrders, orderType)
  const { allowsOffchainSigning } = useWalletDetails()
  const pendingOrdersPrices = useAtomValue(pendingOrdersPricesAtom)
  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const getSpotPrice = useGetSpotPrice()
  const selectReceiptOrder = useSelectReceiptOrder()
  const isSafeViaWc = useIsSafeViaWc()
  const ordersPermitStatus = useGetOrdersPermitStatus()
  const injectedWidgetParams = useInjectedWidgetParams()
  const [searchTerm, setSearchTerm] = useState('')

  const { currentTabId, currentPageNumber } = useMemo(() => {
    const params = parseOrdersTableUrl(location.search)

    return {
      currentTabId: params.tabId || OPEN_TAB.id,
      currentPageNumber: params.pageNumber || 1,
    }
  }, [location.search])

  const orders = useMemo(() => {
    return getOrdersListByIndex(ordersList, currentTabId)
  }, [ordersList, currentTabId])

  const tabs = useMemo(() => {
    return ORDERS_TABLE_TABS.map((tab) => {
      return { ...tab, isActive: tab.id === currentTabId, count: getOrdersListByIndex(ordersList, tab.id).length }
    })
  }, [currentTabId, ordersList])

  const isOpenOrdersTab = useMemo(() => OPEN_TAB.id === currentTabId, [currentTabId])

  const balancesState = useTokensBalances()
  const allowancesState = useTokensAllowances()

  const balancesAndAllowances: BalancesAndAllowances = useMemo(() => {
    const { isLoading: balancesLoading, values: balances } = balancesState
    const { isLoading: allowancesLoading, values: allowances } = allowancesState
    return {
      isLoading: balancesLoading || allowancesLoading,
      balances,
      allowances,
    }
  }, [balancesState, allowancesState])

  const { pendingActivity } = useCategorizeRecentActivity()

  const toggleOrdersForCancellation = useCallback(
    (orders: ParsedOrder[]) => {
      updateOrdersToCancel(orders)
    },
    [updateOrdersToCancel],
  )

  const toggleOrderForCancellation = useCallback(
    (order: ParsedOrder) => {
      updateOrdersToCancel(toggleOrderInCancellationList(ordersToCancel, order))
    },
    [ordersToCancel, updateOrdersToCancel],
  )

  const getShowCancellationModal = useCallback(
    (order: ParsedOrder) => {
      const rawOrder = allOrders.find((item) => item.id === order.id)

      return rawOrder ? cancelOrder(rawOrder) : null
    },
    [allOrders, cancelOrder],
  )

  const getAlternativeOrderModalContext = useGetAlternativeOrderModalContextCallback()

  const approveOrderToken = useOrdersTableTokenApprove()

  const orderActions: OrderActions = {
    getShowCancellationModal,
    getAlternativeOrderModalContext,
    selectReceiptOrder,
    toggleOrderForCancellation,
    toggleOrdersForCancellation,
    approveOrderToken,
  }

  // Set page params initially once
  useEffect(() => {
    navigate(buildOrdersTableUrl(location, { pageNumber: currentPageNumber, tabId: currentTabId }), { replace: true })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useValidatePageUrlParams(orders.length, currentTabId, currentPageNumber)

  const ordersToCheckPendingPermit = useGetOrdersToCheckPendingPermit(ordersList, chainId, balancesAndAllowances)

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders

    const searchTermLower = searchTerm.toLowerCase().trim()

    return orders.filter((order) => {
      const parsedOrder = getParsedOrderFromTableItem(order)
      const inputToken = parsedOrder.inputToken
      const outputToken = parsedOrder.outputToken

      // Check symbols (case-insensitive)
      if (
        inputToken.symbol?.toLowerCase().includes(searchTermLower) ||
        outputToken.symbol?.toLowerCase().includes(searchTermLower)
      ) {
        return true
      }

      // Clean up the search term but preserve '0x' prefix
      const hasPrefix = searchTermLower.startsWith('0x')
      const cleanedSearch = searchTermLower.replace(/[^0-9a-fx]/g, '') // Allow 'x' for '0x'

      // For exact address matches (40 or 42 chars), do strict comparison
      if (cleanedSearch.length === 40 || cleanedSearch.length === 42) {
        const searchTermNormalized = cleanedSearch.startsWith('0x') ? cleanedSearch : `0x${cleanedSearch}`
        return [inputToken.address, outputToken.address].some(
          (address) => address.toLowerCase() === searchTermNormalized.toLowerCase(),
        )
      }

      // For partial address matches, allow includes
      const searchWithoutPrefix = hasPrefix ? cleanedSearch.slice(2) : cleanedSearch
      return [inputToken.address, outputToken.address].some((address) => {
        const addressWithoutPrefix = address.slice(2).toLowerCase()
        return addressWithoutPrefix.includes(searchWithoutPrefix.toLowerCase())
      })
    })
  }, [orders, searchTerm])

  return (
    <>
      <PendingPermitUpdater orders={ordersToCheckPendingPermit} />

      <OrdersTableContainer
        chainId={chainId}
        tabs={tabs}
        orders={filteredOrders}
        displayOrdersOnlyForSafeApp={displayOrdersOnlyForSafeApp}
        isSafeViaWc={isSafeViaWc}
        isOpenOrdersTab={isOpenOrdersTab}
        currentPageNumber={currentPageNumber}
        pendingOrdersPrices={pendingOrdersPrices}
        balancesAndAllowances={balancesAndAllowances}
        isWalletConnected={!!account}
        orderActions={orderActions}
        getSpotPrice={getSpotPrice}
        selectedOrders={ordersToCancel}
        allowsOffchainSigning={allowsOffchainSigning}
        orderType={orderType}
        pendingActivities={pendingActivity}
        ordersPermitStatus={ordersPermitStatus}
        injectedWidgetParams={injectedWidgetParams}
      >
        {isOpenOrdersTab && orders.length && <MultipleCancellationMenu pendingOrders={tableItemsToOrders(orders)} />}

        <SearchInputContainer>
          <SearchIcon />
          <SearchInput
            type="text"
            placeholder="Token symbol, address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchInputContainer>
      </OrdersTableContainer>

      <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />
    </>
  )
}
