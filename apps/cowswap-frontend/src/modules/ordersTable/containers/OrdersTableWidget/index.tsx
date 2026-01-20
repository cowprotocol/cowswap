import { ReactNode, useMemo, useState, useEffect } from 'react'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import { HistoryStatusFilter } from 'modules/ordersTable/hooks/useFilteredOrders'
import { useGetBuildOrdersTableUrl } from 'modules/ordersTable/hooks/useGetBuildOrdersTableUrl'

import { useNavigate } from 'common/hooks/useNavigate'
import { UnfillableOrdersUpdater } from 'common/updaters/orders/UnfillableOrdersUpdater'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { SearchIcon, SearchInput, SearchInputContainer, StyledCloseIcon, SelectContainer, Select } from './styled'

import { ORDERS_TABLE_PAGE_SIZE, OrderTabId } from '../../const/tabs'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { OrdersTableContainer } from '../../pure/OrdersTableContainer'
import { OrdersTableParams } from '../../types'
import { OrdersTableStateUpdater } from '../../updaters/OrdersTableStateUpdater'
import { tableItemsToOrders } from '../../utils/orderTableGroupUtils'
import { MultipleCancellationMenu } from '../MultipleCancellationMenu'
import { OrdersReceiptModal } from '../OrdersReceiptModal'

function getOrdersPageChunk(orders: ParsedOrder[], pageSize: number, pageNumber: number): ParsedOrder[] {
  const start = (pageNumber - 1) * pageSize
  const end = start + pageSize
  return orders.slice(start, end)
}

const tabsWithPendingOrders: OrderTabId[] = [OrderTabId.open, OrderTabId.unfillable] as const

export function OrdersTableWidget(ordersTableParams: OrdersTableParams): ReactNode {
  const { i18n } = useLingui()
  const navigate = useNavigate()

  const [searchTerm, setSearchTerm] = useState('')
  const [historyStatusFilter, setHistoryStatusFilter] = useState<HistoryStatusFilter>(HistoryStatusFilter.EXECUTED)

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setHistoryStatusFilter(e.target.value as HistoryStatusFilter)
  }

  const { filteredOrders, orders, currentTabId, pendingOrdersPrices, currentPageNumber } = useOrdersTableState() || {}
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()

  useEffect(() => {
    // When moving away from the history tab, reset the showOnlyFilled filter, as the UI for it won't be shown in other tabs:
    if (currentTabId !== OrderTabId.history) setHistoryStatusFilter(HistoryStatusFilter.EXECUTED)
  }, [currentTabId])

  useEffect(() => {
    if (!currentPageNumber || currentPageNumber === 1 || !filteredOrders) return

    // If any filter changes, reset pagination:

    const url = buildOrdersTableUrl({ pageNumber: 1 })

    navigate(url, { replace: true })
  }, [currentPageNumber, searchTerm, historyStatusFilter, filteredOrders, buildOrdersTableUrl, navigate])

  const pendingOrders = useMemo(() => {
    const isTabWithPending = !!currentTabId && tabsWithPendingOrders.includes(currentTabId)

    if (!isTabWithPending || !filteredOrders || typeof currentPageNumber !== 'number') return undefined

    const currentPageItems = getOrdersPageChunk(
      tableItemsToOrders(filteredOrders),
      ORDERS_TABLE_PAGE_SIZE,
      currentPageNumber,
    )

    return currentPageItems.filter((order) => {
      return order.status === OrderStatus.PENDING
    })
  }, [currentTabId, filteredOrders, currentPageNumber])

  const hasPendingOrders = !!pendingOrders?.length

  return (
    <>
      {hasPendingOrders && <UnfillableOrdersUpdater orders={pendingOrders} />}

      <OrdersTableStateUpdater
        searchTerm={searchTerm}
        historyStatusFilter={historyStatusFilter}
        {...ordersTableParams}
      />

      <OrdersTableContainer searchTerm={searchTerm} historyStatusFilter={historyStatusFilter}>
        {hasPendingOrders && <MultipleCancellationMenu pendingOrders={pendingOrders} />}

        {/* Show filters only if there are orders */}
        {!!orders?.length && (
          <>
            {/* Show onlyFilled select only in history tab */}
            {currentTabId === OrderTabId.history && (
              <SelectContainer>
                <Select name="historyStatusFilter" value={historyStatusFilter} onChange={handleSelectChange}>
                  <option value="executed">{i18n._('Executed orders')}</option>
                  <option value="cancelled">{i18n._('Cancelled orders')}</option>
                  <option value="expired">{i18n._('Expired orders')}</option>
                  <option value="failed">{i18n._('Failed orders')}</option>
                  <option value="all">{i18n._('All orders')}</option>
                </Select>
              </SelectContainer>
            )}

            <SearchInputContainer>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder={t`Token symbol, address`}
                name="searchTerm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && <StyledCloseIcon onClick={() => setSearchTerm('')} />}
            </SearchInputContainer>
          </>
        )}
      </OrdersTableContainer>

      {pendingOrdersPrices && <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />}
    </>
  )
}
