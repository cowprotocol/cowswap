import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useLayoutEffect, useMemo, useRef } from 'react'

import { useMediaQuery, useStateWithDeferredValue } from '@cowprotocol/common-hooks'
import { Media, Modal, ModalHeader } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'
import { OrderTabId, TabOrderTypes } from 'entities/routes/routes.atom'

import { OrderStatus } from 'legacy/state/orders/actions'

import { usePendingOrdersPrices } from 'modules/orders'

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

import { usePartiallyUpdateOrdersTableFiltersAtom } from '../../hooks/usePartiallyUpdateOrdersTableFiltersAtom'
import { OrdersTableContainer } from '../../pure/OrdersTable/Container/OrdersTableContainer.pure'
import { ordersTableFiltersAtom } from '../../state/filters/ordersTableFilters.atom'
import { ordersTableStateAtom } from '../../state/ordersTable.atoms'
import { OrdersTableFilters, OrderTableItem } from '../../state/ordersTable.types'
import { ordersTableParamsAtom } from '../../state/params/ordersTableParams.atom'
import { ORDERS_TABLE_PAGE_SIZE } from '../../state/params/ordersTableParams.constants'
import { HistoryStatusFilter } from '../../utils/getFilteredOrders'
import { tableItemsToOrders } from '../../utils/orderTableGroupUtils'
import { MobileOrders } from '../MobileOrders/MobileOrders.container'
import { MultipleCancellationMenu } from '../MultipleCancellationMenu/MultipleCancellationMenu.container'
import { OrdersReceiptModal } from '../OrdersReceiptModal/OrdersReceiptModal.container'

export interface OrdersTableWidgetProps {
  orderType: TabOrderTypes
  onClose(): void
}

interface OrdersTableFiltersControls {
  applyFilters(filters: Partial<OrdersTableFilters>): void
  historyStatusFilter: HistoryStatusFilter
  searchTerm: string
  setSearchTerm(value: string): void
}

const tabsWithPendingOrders: OrderTabId[] = [OrderTabId.OPEN, OrderTabId.UNFILLABLE] as const

export function OrdersTableWidget({ orderType, onClose }: OrdersTableWidgetProps): ReactNode {
  const { i18n } = useLingui()
  const isUpToSmall = useMediaQuery(Media.upToSmall(false))
  const isUpToLarge = useMediaQuery(Media.upToLarge(false))
  const { applyFilters, historyStatusFilter, searchTerm, setSearchTerm } = useOrdersTableFilters()

  useLayoutEffect(() => {
    setSearchTerm('')
  }, [orderType, setSearchTerm])

  const resetSearchTerm = (): void => {
    applyFilters({ searchTerm: '' })
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    applyFilters({ historyStatusFilter: e.target.value as HistoryStatusFilter })
  }

  const handleApplyMobileFilters = (nextSearchTerm: string, nextHistoryStatusFilter: HistoryStatusFilter): void => {
    applyFilters({
      searchTerm: nextSearchTerm,
      historyStatusFilter: nextHistoryStatusFilter,
    })
  }

  const handleResetMobileFilters = (): void => {
    applyFilters({
      searchTerm: '',
      historyStatusFilter: HistoryStatusFilter.ALL,
    })
  }

  const { filteredOrders, reduxOrders } = useAtomValue(ordersTableStateAtom)
  const ordersTableParams = useAtomValue(ordersTableParamsAtom)
  const currentTabId = ordersTableParams.tab
  const currentPageNumber = ordersTableParams.page
  const pendingOrdersPrices = usePendingOrdersPrices()

  const pendingOrdersInCurrentPage = useMemo(
    () => getPendingOrdersInCurrentPage(filteredOrders, currentTabId, currentPageNumber),
    [currentPageNumber, currentTabId, filteredOrders],
  )

  const tableContainer = (
    <OrdersTableContainer orderType={orderType}>
      {!!pendingOrdersInCurrentPage?.length && <MultipleCancellationMenu pendingOrders={pendingOrdersInCurrentPage} />}

      {!!reduxOrders?.length && (
        <>
          {currentTabId === OrderTabId.HISTORY && (
            <SelectContainer>
              <Select name="historyStatusFilter" value={historyStatusFilter} onChange={handleSelectChange}>
                <option value={HistoryStatusFilter.ALL}>{i18n._('All orders')}</option>
                <option value={HistoryStatusFilter.FILLED}>{i18n._('Filled orders')}</option>
                <option value={HistoryStatusFilter.PARTIALLY_FILLED}>{i18n._('Partially filled orders')}</option>
                <option value={HistoryStatusFilter.CANCELLED}>{i18n._('Cancelled orders')}</option>
                <option value={HistoryStatusFilter.EXPIRED}>{i18n._('Expired orders')}</option>
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
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            {searchTerm && <StyledCloseIcon onClick={resetSearchTerm} />}
          </SearchInputContainer>
        </>
      )}
    </OrdersTableContainer>
  )

  // TODO: Missing Modal.Content wrapper and we are always rendering tableContainer even when not used...

  return (
    <>
      {!!pendingOrdersInCurrentPage?.length && <UnfillableOrdersUpdater orders={pendingOrdersInCurrentPage} />}

      {isUpToSmall ? (
        <Modal.Root>
          <MobileOrders
            orderType={orderType}
            searchTerm={searchTerm}
            historyStatusFilter={historyStatusFilter}
            onApplyFilters={handleApplyMobileFilters}
            onResetFilters={handleResetMobileFilters}
            onClose={onClose}
          />
        </Modal.Root>
      ) : isUpToLarge ? (
        <Modal.Root>
          <ModalHeader title={t`Limit orders`} onClose={onClose} sticky />
          <Modal.Content $noPadding>{tableContainer}</Modal.Content>
        </Modal.Root>
      ) : (
        tableContainer
      )}

      {pendingOrdersPrices && <OrdersReceiptModal pendingOrdersPrices={pendingOrdersPrices} />}
    </>
  )
}

function getOrdersPageChunk(orders: ParsedOrder[], pageSize: number, pageNumber: number): ParsedOrder[] {
  const start = (pageNumber - 1) * pageSize
  const end = start + pageSize
  return orders.slice(start, end)
}

function getPendingOrdersInCurrentPage(
  filteredOrders: OrderTableItem[],
  currentTabId: OrderTabId | null | undefined,
  currentPageNumber: number | null | undefined,
): ParsedOrder[] | undefined {
  const isTabWithPending = !!currentTabId && tabsWithPendingOrders.includes(currentTabId)

  if (!isTabWithPending || typeof currentPageNumber !== 'number') return undefined

  const currentPageItems = getOrdersPageChunk(
    tableItemsToOrders(filteredOrders),
    ORDERS_TABLE_PAGE_SIZE,
    currentPageNumber,
  )

  return currentPageItems.filter((order) => order.status === OrderStatus.PENDING)
}

function useOrdersTableFilters(): OrdersTableFiltersControls {
  const currentFilters = useAtomValue(ordersTableFiltersAtom)
  const partiallyUpdateOrdersTableFilters = usePartiallyUpdateOrdersTableFiltersAtom()
  const skipNextDeferredSearchUpdate = useRef(false)

  const [searchTerm, setSearchTerm] = useStateWithDeferredValue(currentFilters.searchTerm, (nextSearchTerm) => {
    if (skipNextDeferredSearchUpdate.current) {
      skipNextDeferredSearchUpdate.current = false
      return
    }

    partiallyUpdateOrdersTableFilters({ searchTerm: nextSearchTerm })
  })

  const applyFilters = useCallback(
    (filters: Partial<OrdersTableFilters>): void => {
      if (filters.searchTerm !== undefined && filters.searchTerm !== searchTerm) {
        skipNextDeferredSearchUpdate.current = true
        setSearchTerm(filters.searchTerm)
      }

      partiallyUpdateOrdersTableFilters(filters)
    },
    [partiallyUpdateOrdersTableFilters, searchTerm, setSearchTerm],
  )

  return {
    applyFilters,
    historyStatusFilter: currentFilters.historyStatusFilter,
    searchTerm,
    setSearchTerm,
  }
}
