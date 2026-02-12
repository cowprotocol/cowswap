import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useMemo } from 'react'

import { useWalletInfo, useWalletDetails } from '@cowprotocol/wallet'

import { usePendingOrdersPrices } from 'modules/orders/hooks/usePendingOrdersPrices'
import { useOrderActions } from 'modules/ordersTable/hooks/useOrderActions'
import { useOrdersTableFilters } from 'modules/ordersTable/hooks/useOrdersTableFilters'
import { pageParamAtom } from 'modules/ordersTable/state/params/ordersTableParams.atoms'

import { useOrdersToCancelMap } from 'common/hooks/useMultipleOrdersCancellation/useOrdersToCancelMap'
import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'

import { TABLE_HEADERS } from './Header/ordersTableHeader.constants'
import { OrdersTableHeader } from './Header/OrdersTableHeader.pure'
import { LoadMoreOrdersSection } from './LoadMore/Section/LoadMoreOrdersSection'
import { Rows, TableBox, TableInner } from './OrdersTable.styled'
import { OrdersTablePagination } from './Pagination/OrdersTablePagination.pure'
import { OrdersTableRow } from './Row/OrdersTableRow.pure'

import { useGetBuildOrdersTableUrl } from '../../hooks/url/useGetBuildOrdersTableUrl'
import { useOrdersTableState } from '../../hooks/useOrdersTableState'
import { TabOrderTypes } from '../../state/ordersTable.types'
import { ORDERS_TABLE_PAGE_SIZE, OrderTabId } from '../../state/tabs/ordersTableTabs.constants'
import { getParsedOrderFromTableItem, isParsedOrder } from '../../utils/orderTableGroupUtils'

export interface OrdersTableProps {
  currentTab: OrderTabId
}

export function OrdersTable({ currentTab }: OrdersTableProps): ReactNode {
  const { chainId } = useWalletInfo()
  const { allowsOffchainSigning } = useWalletDetails()
  const pendingOrdersPrices = usePendingOrdersPrices()
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()
  const ordersToCancelMap = useOrdersToCancelMap()

  // TODO: Shouldn't the default be 1?
  const { orderType } = useOrdersTableFilters() || {}
  const currentPageNumber = useAtomValue(pageParamAtom)

  const { filteredOrders, balancesAndAllowances } = useOrdersTableState() || {}

  const orderActions = useOrderActions()

  const step = currentPageNumber * ORDERS_TABLE_PAGE_SIZE

  const ordersPage = (filteredOrders || []).slice(step - ORDERS_TABLE_PAGE_SIZE, step)

  const onScroll = useCallback(() => {
    // Emit event to close OrderContextMenu
    document.body.dispatchEvent(new Event('mousedown', { bubbles: true }))
  }, [])

  const isRowSelectable = !!allowsOffchainSigning

  const cancellableOrders = useMemo(
    () => ordersPage.filter((item) => isOrderOffChainCancellable(getParsedOrderFromTableItem(item))),
    [ordersPage],
  )

  const allOrdersSelected = useMemo(() => {
    if (!cancellableOrders.length) return false

    return cancellableOrders.every((item) => ordersToCancelMap[getParsedOrderFromTableItem(item).id])
  }, [cancellableOrders, ordersToCancelMap])

  const getPageUrl = useCallback((index: number) => buildOrdersTableUrl({ pageNumber: index }), [buildOrdersTableUrl])

  const tableHeaders = TABLE_HEADERS

  const visibleHeaders = useMemo(() => {
    const isHistoryTab = currentTab === OrderTabId.history
    return tableHeaders.filter((header) => {
      // If showInHistory is not defined, show the header in all tabs
      if (header.showInHistory === undefined) return true
      // Otherwise, show based on the showInHistory value
      return header.showInHistory === isHistoryTab
    })
  }, [tableHeaders, currentTab])

  if (!chainId || !balancesAndAllowances || !orderActions || !pendingOrdersPrices) return null

  const isTwapTable = orderType === TabOrderTypes.ADVANCED
  const totalFilteredOrders = filteredOrders?.length || 0
  const lastPageNumber = Math.ceil(totalFilteredOrders / ORDERS_TABLE_PAGE_SIZE)

  return (
    <>
      <TableBox>
        <TableInner onScroll={onScroll}>
          <OrdersTableHeader
            currentTab={currentTab}
            ordersPage={ordersPage}
            cancellableOrders={cancellableOrders}
            allOrdersSelected={allOrdersSelected}
            visibleHeaders={visibleHeaders}
            isRowSelectable={isRowSelectable}
            isTwapTable={isTwapTable}
          />

          <Rows>
            {ordersPage.map((item) => {
              const id = isParsedOrder(item) ? item.id : item.parent.id

              return <OrdersTableRow key={id} currentTab={currentTab} isTwapTable={isTwapTable} item={item} />
            })}
          </Rows>
        </TableInner>
      </TableBox>

      {/* Only show pagination if more than 1 page available */}
      {totalFilteredOrders > ORDERS_TABLE_PAGE_SIZE && (
        <OrdersTablePagination
          getPageUrl={getPageUrl}
          pageSize={ORDERS_TABLE_PAGE_SIZE}
          totalCount={totalFilteredOrders}
          currentPage={currentPageNumber}
        />
      )}

      {currentTab === OrderTabId.open && currentPageNumber === lastPageNumber && orderType === TabOrderTypes.LIMIT && (
        <LoadMoreOrdersSection totalOpenOrders={totalFilteredOrders} />
      )}
    </>
  )
}
