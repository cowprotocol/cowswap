import React, { useCallback, useEffect, useMemo, useRef } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Media, UI } from '@cowprotocol/ui'
import { Currency, Price } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { PendingOrdersPrices } from 'modules/orders/state/pendingOrdersPricesAtom'
import { SpotPricesKeyParams } from 'modules/orders/state/spotPricesAtom'
import { BalancesAndAllowances } from 'modules/tokens'

import { CancellableOrder } from 'common/utils/isOrderCancellable'
import { isOrderOffChainCancellable } from 'common/utils/isOrderOffChainCancellable'

import { CheckboxCheckmark, TableHeader, TableRowCheckbox, TableRowCheckboxWrapper } from './styled'
import { TableGroup } from './TableGroup'
import { createTableHeaders } from './tableHeaders'
import { OrderActions } from './types'

import { HISTORY_TAB, ORDERS_TABLE_PAGE_SIZE } from '../../const/tabs'
import { OrderRow } from '../../containers/OrderRow'
import { useGetBuildOrdersTableUrl } from '../../hooks/useGetBuildOrdersTableUrl'
import { getOrderParams } from '../../utils/getOrderParams'
import {
  getParsedOrderFromTableItem,
  isParsedOrder,
  OrderTableItem,
  tableItemsToOrders,
} from '../../utils/orderTableGroupUtils'
import { OrdersTablePagination } from '../OrdersTablePagination'

// TODO: move elements to styled.jsx

const TableBox = styled.div`
  display: flex;
  flex-flow: column wrap;
  border: none;
  padding: 0;
  position: relative;
  background: var(${UI.COLOR_PAPER});
  width: 100%;
`

const TableInner = styled.div`
  display: block;
  width: inherit;
  height: inherit;
  padding: 0;
  overflow-y: hidden;
  overflow-x: auto;
  ${({ theme }) => theme.colorScrollbar};
`

const HeaderElement = styled.div<{ doubleRow?: boolean }>`
  height: 100%;
  padding: 0;
  font-size: 12px;
  line-height: 1.1;
  font-weight: 500;
  display: flex;
  align-items: ${({ doubleRow }) => (doubleRow ? 'flex-start' : 'center')};

  > span {
    display: flex;
    flex-flow: row wrap;
    align-items: center;
  }

  ${({ doubleRow }) =>
    doubleRow &&
    `
    flex-flow: column wrap;
    justify-content: center;
    gap: 2px;

    > i {
      opacity: 0.7;
    }
  `}
`

const Rows = styled.div`
  display: block;
  ${({ theme }) => theme.colorScrollbar};

  ${Media.upToLargeAlt()} {
    display: flex;
    flex-flow: column wrap;
  }
`

export interface OrdersTableProps {
  currentTab: string
  allowsOffchainSigning: boolean
  chainId: SupportedChainId
  pendingOrdersPrices: PendingOrdersPrices
  orders: OrderTableItem[]
  selectedOrders: CancellableOrder[]
  balancesAndAllowances: BalancesAndAllowances
  getSpotPrice: (params: SpotPricesKeyParams) => Price<Currency, Currency> | null
  orderActions: OrderActions
  currentPageNumber: number
  isTwapTable: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function OrdersTable({
  currentTab,
  selectedOrders,
  allowsOffchainSigning,
  chainId,
  orders,
  pendingOrdersPrices,
  balancesAndAllowances,
  getSpotPrice,
  orderActions,
  currentPageNumber,
  isTwapTable,
}: OrdersTableProps) {
  const buildOrdersTableUrl = useGetBuildOrdersTableUrl()
  const checkboxRef = useRef<HTMLInputElement>(null)

  const step = currentPageNumber * ORDERS_TABLE_PAGE_SIZE

  const ordersPage = orders.slice(step - ORDERS_TABLE_PAGE_SIZE, step)

  const onScroll = useCallback(() => {
    // Emit event to close OrderContextMenu
    document.body.dispatchEvent(new Event('mousedown', { bubbles: true }))
  }, [])

  const isRowSelectable = allowsOffchainSigning

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

  // React doesn't support indeterminate attribute
  // Because of it, we have to use element reference
  useEffect(() => {
    const checkbox = checkboxRef.current

    if (!checkbox) return

    checkbox.indeterminate = !!selectedOrders.length && !allOrdersSelected
    checkbox.checked = allOrdersSelected
  }, [allOrdersSelected, selectedOrders.length])

  const tableHeaders = useMemo(() => createTableHeaders(), [])

  const visibleHeaders = useMemo(() => {
    const isHistoryTab = currentTab === HISTORY_TAB.id
    return tableHeaders.filter((header) => {
      // If showInHistory is not defined, show the header in all tabs
      if (header.showInHistory === undefined) return true
      // Otherwise, show based on the showInHistory value
      return header.showInHistory === isHistoryTab
    })
  }, [tableHeaders, currentTab])

  return (
    <>
      <TableBox>
        <TableInner onScroll={onScroll}>
          <TableHeader
            isHistoryTab={currentTab === HISTORY_TAB.id}
            isRowSelectable={isRowSelectable}
            isTwapTable={isTwapTable}
          >
            {visibleHeaders.map((header) => {
              if (header.id === 'checkbox' && (!isRowSelectable || currentTab === HISTORY_TAB.id)) {
                return null
              }

              if (header.id === 'checkbox') {
                return (
                  <HeaderElement key={header.id}>
                    <TableRowCheckboxWrapper>
                      <TableRowCheckbox
                        ref={checkboxRef}
                        disabled={cancellableOrders.length === 0}
                        type="checkbox"
                        onChange={(event) =>
                          orderActions.toggleOrdersForCancellation(
                            event.target.checked ? tableItemsToOrders(ordersPage) : [],
                          )
                        }
                      />
                      <CheckboxCheckmark />
                    </TableRowCheckboxWrapper>
                  </HeaderElement>
                )
              }

              return (
                <HeaderElement key={header.id} doubleRow={header.doubleRow}>
                  {header.content}
                  {header.extraComponent}
                </HeaderElement>
              )
            })}
          </TableHeader>

          <Rows>
            {ordersPage.map((item) => {
              const { inputToken, outputToken } = getParsedOrderFromTableItem(item)
              const spotPrice = getSpotPrice({
                chainId: chainId as SupportedChainId,
                sellTokenAddress: inputToken.address,
                buyTokenAddress: outputToken.address,
              })

              if (isParsedOrder(item)) {
                const order = item

                return (
                  <OrderRow
                    key={order.id}
                    isRowSelectable={isRowSelectable}
                    isRowSelected={!!selectedOrdersMap[order.id]}
                    isHistoryTab={currentTab === HISTORY_TAB.id}
                    order={order}
                    spotPrice={spotPrice}
                    prices={pendingOrdersPrices[order.id]}
                    isRateInverted={false}
                    orderParams={getOrderParams(chainId, balancesAndAllowances, order)}
                    onClick={() => orderActions.selectReceiptOrder(order)}
                    orderActions={orderActions}
                    isTwapTable={isTwapTable}
                    chainId={chainId}
                    balancesAndAllowances={balancesAndAllowances}
                  />
                )
              } else {
                return (
                  <TableGroup
                    item={item}
                    chainId={chainId}
                    balancesAndAllowances={balancesAndAllowances}
                    key={item.parent.id}
                    isRowSelectable={isRowSelectable}
                    isRowSelected={!!selectedOrdersMap[item.parent.id]}
                    isHistoryTab={currentTab === HISTORY_TAB.id}
                    spotPrice={spotPrice}
                    prices={pendingOrdersPrices[item.parent.id]}
                    isRateInverted={false}
                    orderActions={orderActions}
                    isTwapTable={isTwapTable}
                  />
                )
              }
            })}
          </Rows>
        </TableInner>
      </TableBox>

      {/* Only show pagination if more than 1 page available */}
      {orders.length > ORDERS_TABLE_PAGE_SIZE && (
        <OrdersTablePagination
          getPageUrl={getPageUrl}
          pageSize={ORDERS_TABLE_PAGE_SIZE}
          totalCount={orders.length}
          currentPage={currentPageNumber}
        />
      )}
    </>
  )
}
