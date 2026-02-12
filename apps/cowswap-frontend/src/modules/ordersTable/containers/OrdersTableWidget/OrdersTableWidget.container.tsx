import { ReactNode, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import { usePendingOrdersPrices } from 'modules/orders/hooks/usePendingOrdersPrices'

import { UnfillableOrdersUpdater } from 'common/updaters/orders/UnfillableOrdersUpdater'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import {
  SearchIcon,
  SearchInput,
  SearchInputContainer,
  StyledCloseIcon,
  SelectContainer,
  Select,
} from './OrdersTableWidget.styled'

import { HistoryStatusFilter } from '../../hooks/useFilteredOrders'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { useOrdersTableFilters, usePartiallyUpdateOrdersTableFiltersAtom } from '../../hooks/useOrdersTableFilters'
import { OrdersTableContainer } from '../../pure/OrdersTable/Container/OrdersTableContainer.pure'
import { OrdersTableParams } from '../../state/ordersTable.types'
import { ORDERS_TABLE_PAGE_SIZE, OrderTabId } from '../../state/tabs/ordersTableTabs.constants'
import { tableItemsToOrders } from '../../utils/orderTableGroupUtils'
import { MultipleCancellationMenu } from '../MultipleCancellationMenu/MultipleCancellationMenu.container'
import { OrdersReceiptModal } from '../OrdersReceiptModal/OrdersReceiptModal.container'
import { ordersTableURLParamsAtom } from '../../state/ordersTable.atoms'
import { useAtomValue } from 'jotai'

function getOrdersPageChunk(orders: ParsedOrder[], pageSize: number, pageNumber: number): ParsedOrder[] {
  const start = (pageNumber - 1) * pageSize
  const end = start + pageSize
  return orders.slice(start, end)
}

const tabsWithPendingOrders: OrderTabId[] = [OrderTabId.open, OrderTabId.unfillable] as const

// eslint-disable-next-line max-lines-per-function
export function OrdersTableWidget(/*{ orders: allOrders }: OrdersTableParams*/): ReactNode {
  const { i18n } = useLingui()

  const { searchTerm, historyStatusFilter } = useOrdersTableFilters()
  const partiallyUpdateOrdersTableFilters = usePartiallyUpdateOrdersTableFiltersAtom()

  const resetSearchTerm = (): void => {
    partiallyUpdateOrdersTableFilters({ searchTerm: '' })
  }

  // TODO: Debounce:
  const handleSearchTermChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    partiallyUpdateOrdersTableFilters({ searchTerm: e.target.value })
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    partiallyUpdateOrdersTableFilters({ historyStatusFilter: e.target.value as HistoryStatusFilter })
  }

  const { filteredOrders, reduxOrders } = useOrdersTableState() || {}
  const ordersTableURLParams = useAtomValue(ordersTableURLParamsAtom)
  const currentTabId = ordersTableURLParams.tab || OrderTabId.open;
  const currentPageNumber = ordersTableURLParams.page || 1;
  const pendingOrdersPrices = usePendingOrdersPrices()

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

      { /* <OrdersTableStateUpdater orders={ allOrders } /> */ }

      <OrdersTableContainer>
        {hasPendingOrders && <MultipleCancellationMenu pendingOrders={pendingOrders} />}

        {/* Show filters only if there are orders */}
        {!!reduxOrders?.length && (
          <>
            {/* Show onlyFilled select only in history tab */}
            {currentTabId === OrderTabId.history && (
              <SelectContainer>
                <Select name="historyStatusFilter" value={historyStatusFilter} onChange={handleSelectChange}>
                  <option value="filled">{i18n._('Filled orders')}</option>
                  <option value="cancelled">{i18n._('Cancelled orders')}</option>
                  <option value="expired">{i18n._('Expired orders')}</option>
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
                onChange={handleSearchTermChange}
              />
              {searchTerm && <StyledCloseIcon onClick={resetSearchTerm} />}
            </SearchInputContainer>
          </>
        )}
      </OrdersTableContainer>

      {pendingOrdersPrices && <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />}
    </>
  )
}
