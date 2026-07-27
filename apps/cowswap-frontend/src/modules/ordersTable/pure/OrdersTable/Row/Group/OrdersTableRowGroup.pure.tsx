import React, { ReactNode, useEffect, useState } from 'react'

import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Price } from '@cowprotocol/currency'

import { Trans } from '@lingui/react/macro'
import { transparentize } from 'color2k'
import { useTwapOrderById } from 'entities/twap'
import styled from 'styled-components/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import type { PendingOrderPrices } from 'modules/orders'
import { useEoaTwapPartOrders } from 'modules/twap'

import { OrderRow } from '../../../../containers/OrderRow/OrderRow.container'
import { OrderActions, OrderTableGroup } from '../../../../state/ordersTable.types'
import { ORDERS_TABLE_PAGE_SIZE } from '../../../../state/params/ordersTableParams.constants'
import { getOrderParams } from '../../../../utils/getOrderParams'
import { TwapStatusAndToggle } from '../../../TwapStatusAndToggle/TwapStatusAndToggle.pure'
import { OrdersTablePagination } from '../../Pagination/OrdersTablePagination.pure'

const GroupBox = styled.div``
const PartPageState = styled.div`
  padding: 16px;
  text-align: center;
`

const Pagination = styled(OrdersTablePagination)`
  background: ${({ theme }) => transparentize(theme.text, 0.91)};
  margin: 0;
  padding: 10px 0;
`

export interface OrdersTableRowGroupProps {
  item: OrderTableGroup
  prices: PendingOrderPrices | undefined | null
  spotPrice: Price<Currency, Currency> | undefined | null
  isRateInverted: boolean
  isHistoryTab: boolean
  isRowSelectable: boolean
  isRowSelected: boolean
  orderActions: OrderActions
  chainId: SupportedChainId
  balancesAndAllowances: BalancesAndAllowances
  isTwapTable?: boolean
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
export function OrdersTableRowGroup({
  item,
  prices,
  spotPrice,
  isRateInverted,
  isHistoryTab,
  isRowSelectable,
  isRowSelected,
  orderActions,
  chainId,
  balancesAndAllowances,
  isTwapTable,
}: OrdersTableRowGroupProps): ReactNode {
  const { parent, children } = item

  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const twapOrder = useTwapOrderById(parent.id)
  const isIndexedEoaOrder = twapOrder?.partOrdersCount !== undefined
  const childrenLength = isIndexedEoaOrder ? (twapOrder.partOrdersCount ?? 0) : children.length
  const step = currentPage * ORDERS_TABLE_PAGE_SIZE
  const indexedParts = useEoaTwapPartOrders(twapOrder, parent, currentPage, isIndexedEoaOrder && !isCollapsed)
  const childrenPage = isIndexedEoaOrder ? indexedParts.orders : children.slice(step - ORDERS_TABLE_PAGE_SIZE, step)

  useEffect(() => {
    if (currentPage > Math.max(1, Math.ceil(childrenLength / ORDERS_TABLE_PAGE_SIZE))) setCurrentPage(1)
  }, [childrenLength, currentPage])

  const isParentSigning = parent.status === OrderStatus.PRESIGNATURE_PENDING

  const commonProps = {
    isRowSelectable,
    isHistoryTab,
    spotPrice,
    prices,
    isRateInverted,
    orderActions,
    isTwapTable,
    chainId,
    balancesAndAllowances,
  }

  // Create an array of child order data with their orderParams
  const childrenWithParams = (isIndexedEoaOrder ? [] : children).map((child) => ({
    order: child,
    orderParams: getOrderParams(chainId, balancesAndAllowances, child),
  }))

  return (
    <GroupBox>
      <OrderRow
        {...commonProps}
        key={parent.id}
        isRowSelected={isRowSelected}
        order={parent}
        orderParams={getOrderParams(chainId, balancesAndAllowances, parent)}
        onClick={() => orderActions.selectReceiptOrder(parent)}
        isExpanded={!isCollapsed}
        childOrders={isIndexedEoaOrder ? [] : children}
      >
        {isParentSigning ? undefined : (
          <TwapStatusAndToggle
            approveOrderToken={orderActions.approveOrderToken}
            parent={parent}
            childrenLength={childrenLength}
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed((state) => !state)}
            onClick={() => orderActions.selectReceiptOrder(parent)}
            childOrders={childrenWithParams}
          />
        )}
      </OrderRow>

      {!isCollapsed && (
        <div>
          <PartPageStatus state={indexedParts} />
          {childrenPage.map((child) => (
            <OrderRow
              {...commonProps}
              key={child.id}
              isChild={true}
              isRowSelected={false}
              order={child}
              orderParams={getOrderParams(chainId, balancesAndAllowances, child)}
              onClick={() => orderActions.selectReceiptOrder(child)}
            />
          ))}
          {/* Only show pagination if more than 1 page available */}
          {childrenLength > ORDERS_TABLE_PAGE_SIZE && (
            <Pagination
              pageSize={ORDERS_TABLE_PAGE_SIZE}
              totalCount={childrenLength}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      )}
    </GroupBox>
  )
}

function PartPageStatus({ state }: { state: ReturnType<typeof useEoaTwapPartOrders> }): ReactNode {
  if (state.isLoading) {
    return (
      <PartPageState>
        <Trans>Loading...</Trans>
      </PartPageState>
    )
  }

  if (!state.error) return null

  return (
    <PartPageState>
      <button type="button" onClick={state.retry}>
        <Trans>Retry</Trans>
      </button>
    </PartPageState>
  )
}
