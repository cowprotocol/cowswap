import React, { ReactNode, useCallback, useMemo } from 'react'

import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'

import { OrderTableRow } from './OrderTableRow'
import { Rows, TableBox, TableInner } from './styled'
import { TableHeader } from './TableHeader'

import { ORDERS_TABLE_PAGE_SIZE, OrderTabId } from '../../../const/tabs'
import { useGetBuildOrdersTableUrl } from '../../../hooks/useGetBuildOrdersTableUrl'
import { useOrdersTableState } from '../../../hooks/useOrdersTableState'
import { getParsedOrderFromTableItem, isParsedOrder } from '../../../utils/orderTableGroupUtils'
import { OrdersTablePagination } from '../../OrdersTablePagination'
import { TABLE_HEADERS } from '../tableHeaders'

export interface OrdersTableProps {
  currentTab: OrderTabId
}

export function OrdersTable({ currentTab }: OrdersTableProps): ReactNode {
  const {
    selectedOrders,
    allowsOffchainSigning,
    chainId,
    filteredOrders,
    pendingOrdersPrices,
    balancesAndAllowances,
    getSpotPrice,
    orderActions,
    currentPageNumber = 0,
  } = useOrdersTableState() || {}
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()

  const step = currentPageNumber * ORDERS_TABLE_PAGE_SIZE

  const ordersPage = (filteredOrders || []).slice(step - ORDERS_TABLE_PAGE_SIZE, step)

  const onScroll = useCallback(() => {
    // Emit event to close OrderContextMenu
    document.body.dispatchEvent(new Event('mousedown', { bubbles: true }))
  }, [])

  const isRowSelectable = !!allowsOffchainSigning

  const selectedOrdersMap = useMemo(() => {
    if (!selectedOrders) return {}

    return selectedOrders.reduce(
      (acc, val) => {
        acc[val.id] = true
        return acc
      },
      {} as { [key: string]: true },
    )
  }, [selectedOrders])

  const cancellableOrders = useMemo(
    () => ordersPage.filter((item) => isOrderOffChainCancellable(getParsedOrderFromTableItem(item))),
    [ordersPage],
  )

  const allOrdersSelected = useMemo(() => {
    if (!cancellableOrders.length) return false

    return cancellableOrders.every((item) => selectedOrdersMap[getParsedOrderFromTableItem(item).id])
  }, [cancellableOrders, selectedOrdersMap])

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

  return (
    <>
      <TableBox>
        <TableInner onScroll={onScroll}>
          <TableHeader
            currentTab={currentTab}
            ordersPage={ordersPage}
            cancellableOrders={cancellableOrders}
            allOrdersSelected={allOrdersSelected}
            visibleHeaders={visibleHeaders}
            isRowSelectable={isRowSelectable}
          />

          <Rows>
            {getSpotPrice &&
              ordersPage.map((item) => {
                const id = isParsedOrder(item) ? item.id : item.parent.id

                return <OrderTableRow key={id} item={item} currentTab={currentTab} />
              })}
          </Rows>
        </TableInner>
      </TableBox>

      {/* Only show pagination if more than 1 page available */}
      {filteredOrders && filteredOrders.length > ORDERS_TABLE_PAGE_SIZE && (
        <OrdersTablePagination
          getPageUrl={getPageUrl}
          pageSize={ORDERS_TABLE_PAGE_SIZE}
          totalCount={filteredOrders.length}
          currentPage={currentPageNumber}
        />
      )}
    </>
  )
}
