import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'

import { useTokensAllowances, useTokensBalances } from '@cowprotocol/balances-and-allowances'
import { Media, UI } from '@cowprotocol/ui'
import { useIsSafeViaWc, useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { Search } from 'react-feather'
import { useLocation } from 'react-router'
import styled from 'styled-components/macro'

import { Order } from 'legacy/state/orders/actions'

import { useInjectedWidgetParams } from 'modules/injectedWidget'
import { pendingOrdersPricesAtom } from 'modules/orders/state/pendingOrdersPricesAtom'
import { useGetSpotPrice } from 'modules/orders/state/spotPricesAtom'
import type { BalancesAndAllowances } from 'modules/tokens'

import { useCancelOrder } from 'common/hooks/useCancelOrder'
import { useCategorizeRecentActivity } from 'common/hooks/useCategorizeRecentActivity'
import { ordersToCancelAtom, updateOrdersToCancelAtom } from 'common/hooks/useMultipleOrdersCancellation/state'
import { useNavigate } from 'common/hooks/useNavigate'
import { CloseIcon } from 'common/pure/CloseIcon'
import { CancellableOrder } from 'common/utils/isOrderCancellable'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { OrdersTableList, useOrdersTableList } from './hooks/useOrdersTableList'
import { useOrdersTableTokenApprove } from './hooks/useOrdersTableTokenApprove'
import { useValidatePageUrlParams } from './hooks/useValidatePageUrlParams'

import { ALL_ORDERS_TAB, OPEN_TAB, ORDERS_TABLE_TABS } from '../../const/tabs'
import { OrdersTableContainer } from '../../pure/OrdersTableContainer'
import { OrderActions } from '../../pure/OrdersTableContainer/types'
import { TabOrderTypes } from '../../types'
import { buildOrdersTableUrl } from '../../utils/buildOrdersTableUrl'
import { getParsedOrderFromTableItem, OrderTableItem, tableItemsToOrders } from '../../utils/orderTableGroupUtils'
import { parseOrdersTableUrl } from '../../utils/parseOrdersTableUrl'
import { MultipleCancellationMenu } from '../MultipleCancellationMenu'
import { OrdersReceiptModal } from '../OrdersReceiptModal'
import { useGetAlternativeOrderModalContextCallback, useSelectReceiptOrder } from '../OrdersReceiptModal/hooks'

const SearchInputContainer = styled.div`
  margin: 0;
  padding: 0 0 0 16px;
  position: relative;

  ${Media.upToMedium()} {
    padding: 0;
  }
`

const SearchIcon = styled(Search)`
  position: absolute;
  left: 28px;
  top: 50%;
  transform: translateY(-50%);
  color: var(${UI.COLOR_TEXT_OPACITY_50});
  width: 16px;
  height: 16px;

  ${Media.upToMedium()} {
    left: 10px;
  }
`

const StyledCloseIcon = styled(CloseIcon)`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;

  > svg {
    width: 100%;
    height: 100%;
  }
`

const SearchInput = styled.input`
  width: 100%;
  padding: 8px 36px;
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_10});
  background: var(${UI.COLOR_PAPER});
  color: var(${UI.COLOR_TEXT});
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  min-height: 36px;

  ${Media.upToMedium()} {
    padding: 8px 32px;
    border-radius: 12px;
  }

  &::placeholder {
    color: var(${UI.COLOR_TEXT_OPACITY_50});
  }

  &:focus {
    outline: none;
    border-color: var(${UI.COLOR_TEXT_OPACITY_50});
  }

  // iOS-specific zoom prevention
  @supports (-webkit-touch-callout: none) {
    &:hover,
    &:active {
      font-size: 16px;
    }
  }
`

function getOrdersListByIndex(ordersList: OrdersTableList, id: string): OrderTableItem[] {
  switch (id) {
    case 'all':
      return ordersList.all
    case 'unfillable':
      return ordersList.unfillable
    case 'signing':
      return ordersList.signing
    case 'open':
      return ordersList.pending
    case 'history':
      return ordersList.history
    default:
      return ordersList.pending
  }
}

function toggleOrderInCancellationList(state: CancellableOrder[], order: CancellableOrder): CancellableOrder[] {
  const isOrderIncluded = state.find((item) => item.id === order.id)

  if (isOrderIncluded) {
    return state.filter((item) => item.id !== order.id)
  }

  return [...state, order]
}

interface OrdersTableWidgetProps {
  orders: Order[]
  orderType: TabOrderTypes
  isTwapTable?: boolean
  displayOrdersOnlyForSafeApp?: boolean
  children?: ReactNode
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function OrdersTableWidget({
  orders: allOrders,
  orderType,
  children,
  displayOrdersOnlyForSafeApp = false,
  isTwapTable = false,
}: OrdersTableWidgetProps) {
  const { chainId, account } = useWalletInfo()
  const location = useLocation()
  const navigate = useNavigate()
  const cancelOrder = useCancelOrder()
  const { allowsOffchainSigning } = useWalletDetails()
  const pendingOrdersPrices = useAtomValue(pendingOrdersPricesAtom)
  const ordersToCancel = useAtomValue(ordersToCancelAtom)
  const updateOrdersToCancel = useSetAtom(updateOrdersToCancelAtom)
  const getSpotPrice = useGetSpotPrice()
  const selectReceiptOrder = useSelectReceiptOrder()
  const isSafeViaWc = useIsSafeViaWc()
  const injectedWidgetParams = useInjectedWidgetParams()
  const [searchTerm, setSearchTerm] = useState('')

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

  const ordersList = useOrdersTableList(allOrders, orderType, chainId, balancesAndAllowances)

  const { currentTabId, currentPageNumber } = useMemo(() => {
    if (!account) {
      return {
        currentTabId: ALL_ORDERS_TAB.id,
        currentPageNumber: 1,
      }
    }

    const params = parseOrdersTableUrl(location.search)

    // If we're on a tab that becomes empty (signing or unfillable),
    // default to the all orders tab
    if (
      (params.tabId === 'signing' && !ordersList.signing.length) ||
      (params.tabId === 'unfillable' && !ordersList.unfillable.length)
    ) {
      return {
        currentTabId: ALL_ORDERS_TAB.id,
        currentPageNumber: params.pageNumber || 1,
      }
    }

    return {
      currentTabId: params.tabId || ALL_ORDERS_TAB.id,
      currentPageNumber: params.pageNumber || 1,
    }
  }, [location.search, ordersList.signing.length, ordersList.unfillable.length, account])

  const orders = useMemo(() => {
    return getOrdersListByIndex(ordersList, currentTabId)
  }, [ordersList, currentTabId])

  const tabs = useMemo(() => {
    // If no account, just return the ALL_ORDERS_TAB with count 0
    if (!account) {
      return [{ ...ALL_ORDERS_TAB, count: 0, isActive: true }]
    }

    return ORDERS_TABLE_TABS.filter((tab) => {
      // Only include the unfillable tab if there are unfillable orders
      if (tab.id === 'unfillable') {
        return getOrdersListByIndex(ordersList, tab.id).length > 0
      }
      // Only include the signing tab if there are signing orders
      if (tab.id === 'signing') {
        return getOrdersListByIndex(ordersList, tab.id).length > 0
      }
      return true
    }).map((tab) => {
      return { ...tab, isActive: tab.id === currentTabId, count: getOrdersListByIndex(ordersList, tab.id).length }
    })
  }, [currentTabId, ordersList, account])

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

  // Clear selection when changing tabs
  useEffect(() => {
    updateOrdersToCancel([])
  }, [currentTabId, updateOrdersToCancel])

  const filteredOrders = useMemo(() => {
    if (!searchTerm) return orders

    const searchTermLower = searchTerm.toLowerCase().trim()

    // First try exact symbol matches (case-insensitive)
    const exactMatches = orders.filter((order) => {
      const parsedOrder = getParsedOrderFromTableItem(order)
      const inputToken = parsedOrder.inputToken
      const outputToken = parsedOrder.outputToken

      return [inputToken.symbol, outputToken.symbol].some((symbol) => {
        return symbol?.toLowerCase() === searchTermLower
      })
    })

    // If we have exact matches, return those
    if (exactMatches.length > 0) {
      return exactMatches
    }

    // Otherwise, fall back to partial matches and address search
    return orders.filter((order) => {
      const parsedOrder = getParsedOrderFromTableItem(order)
      const inputToken = parsedOrder.inputToken
      const outputToken = parsedOrder.outputToken

      // Check for partial symbol matches (case-insensitive)
      const symbolMatch = [inputToken.symbol, outputToken.symbol].some((symbol) => {
        return symbol?.toLowerCase().includes(searchTermLower)
      })

      if (symbolMatch) return true

      // If not a symbol match, check for address matches
      // Clean up the search term but preserve '0x' prefix if present
      const hasPrefix = searchTermLower.startsWith('0x')
      const cleanedSearch = searchTermLower.replace(/[^0-9a-fx]/g, '')

      // For exact address matches (40 or 42 chars), do strict comparison
      if (cleanedSearch.length === 40 || cleanedSearch.length === 42) {
        const searchTermNormalized = hasPrefix ? cleanedSearch : `0x${cleanedSearch}`
        return [inputToken.address, outputToken.address].some(
          (address) => address.toLowerCase() === searchTermNormalized.toLowerCase(),
        )
      }

      // For partial address matches
      const searchWithoutPrefix = hasPrefix ? cleanedSearch.slice(2) : cleanedSearch
      if (searchWithoutPrefix.length >= 2) {
        // Only search if we have at least 2 characters
        return [inputToken.address, outputToken.address].some((address) => {
          const addressWithoutPrefix = address.slice(2).toLowerCase()
          return addressWithoutPrefix.includes(searchWithoutPrefix.toLowerCase())
        })
      }

      return false
    })
  }, [orders, searchTerm])

  return (
    <>
      {children}
      <OrdersTableContainer
        chainId={chainId}
        tabs={tabs}
        orders={filteredOrders}
        displayOrdersOnlyForSafeApp={displayOrdersOnlyForSafeApp}
        isSafeViaWc={isSafeViaWc}
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
        injectedWidgetParams={injectedWidgetParams}
        searchTerm={searchTerm}
        isTwapTable={isTwapTable}
      >
        {(currentTabId === OPEN_TAB.id || currentTabId === 'all' || currentTabId === 'unfillable') &&
          orders.length > 0 && <MultipleCancellationMenu pendingOrders={tableItemsToOrders(orders)} />}

        {/* If account is not connected, don't show the search input */}
        {!!account && orders.length > 0 && (
          <SearchInputContainer>
            <SearchIcon />
            <SearchInput
              type="text"
              placeholder="Token symbol, address"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && <StyledCloseIcon onClick={() => setSearchTerm('')} />}
          </SearchInputContainer>
        )}
      </OrdersTableContainer>

      <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />
    </>
  )
}
