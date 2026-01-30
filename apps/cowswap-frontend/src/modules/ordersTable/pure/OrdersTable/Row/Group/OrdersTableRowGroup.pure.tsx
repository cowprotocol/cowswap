import React, { useState } from 'react'

import { BalancesAndAllowances } from '@cowprotocol/balances-and-allowances'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Price } from '@uniswap/sdk-core'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import type { PendingOrderPrices } from 'modules/orders'

import { OrderRow } from '../../../../containers/OrderRow/OrderRow.container'
import { getOrderParams } from '../../../../shared/utils/getOrderParams'
import { OrderActions, OrderTableGroup } from '../../../../state/ordersTable.types'
import { ORDERS_TABLE_PAGE_SIZE } from '../../../../state/tabs/ordersTableTabs.constants'
import { TwapStatusAndToggle } from '../../../TwapStatusAndToggle/TwapStatusAndToggle.pure'
import { OrdersTablePagination } from '../../Pagination/OrdersTablePagination.pure'

const GroupBox = styled.div``

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
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
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
}: OrdersTableRowGroupProps) {
  const { parent, children } = item

  const [isCollapsed, setIsCollapsed] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const childrenLength = children.length
  const step = currentPage * ORDERS_TABLE_PAGE_SIZE
  const childrenPage = children.slice(step - ORDERS_TABLE_PAGE_SIZE, step)

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
  const childrenWithParams = children.map((child) => ({
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
        childOrders={children}
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
