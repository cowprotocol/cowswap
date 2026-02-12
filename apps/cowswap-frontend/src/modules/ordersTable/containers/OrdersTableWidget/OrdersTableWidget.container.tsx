import { useAtomValue } from 'jotai'
import { ReactNode, useMemo } from 'react'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import { usePendingOrdersPrices } from 'modules/orders/hooks/usePendingOrdersPrices'
import { ordersTableParamsAtom } from 'modules/ordersTable/state/params/ordersTableParams.atoms'

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

import { useOrdersTableFilters } from '../../hooks/useOrdersTableFilters'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { usePartiallyUpdateOrdersTableFiltersAtom } from '../../hooks/usePartiallyUpdateOrdersTableFiltersAtom'
import { OrdersTableContainer } from '../../pure/OrdersTable/Container/OrdersTableContainer.pure'
import { ORDERS_TABLE_PAGE_SIZE, OrderTabId } from '../../state/tabs/ordersTableTabs.constants'
import { HistoryStatusFilter } from '../../utils/getFilteredOrders'
import { tableItemsToOrders } from '../../utils/orderTableGroupUtils'
import { MultipleCancellationMenu } from '../MultipleCancellationMenu/MultipleCancellationMenu.container'
import { OrdersReceiptModal } from '../OrdersReceiptModal/OrdersReceiptModal.container'

function getOrdersPageChunk(orders: ParsedOrder[], pageSize: number, pageNumber: number): ParsedOrder[] {
  const start = (pageNumber - 1) * pageSize
  const end = start + pageSize
  return orders.slice(start, end)
}

const tabsWithPendingOrders: OrderTabId[] = [OrderTabId.open, OrderTabId.unfillable] as const

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
  const ordersTableParams = useAtomValue(ordersTableParamsAtom)
  const currentTabId = ordersTableParams.tab
  const currentPageNumber = ordersTableParams.page
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

      {/* <OrdersTableStateUpdater orders={ allOrders } /> */}

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
