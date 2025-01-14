import React, { useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Price } from '@uniswap/sdk-core'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import { PendingOrderPrices } from 'modules/orders/state/pendingOrdersPricesAtom'
import { BalancesAndAllowances } from 'modules/tokens'

import { OrderRow } from './OrderRow'
import { WarningTooltip } from './OrderRow/OrderWarning'
import * as styledEl from './OrderRow/styled'
import { OrderActions } from './types'

import { ORDERS_TABLE_PAGE_SIZE } from '../../const/tabs'
import { getOrderParams } from '../../utils/getOrderParams'
import { OrderTableGroup } from '../../utils/orderTableGroupUtils'
import { OrdersTablePagination } from '../OrdersTablePagination'
import { OrderStatusBox } from '../OrderStatusBox'

const GroupBox = styled.div``

const Pagination = styled(OrdersTablePagination)`
  background: ${({ theme }) => transparentize(theme.text, 0.91)};
  margin: 0;
  padding: 10px 0;
`

const TwapStatusAndToggleWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
`

function TwapStatusAndToggle({
  parent,
  childrenLength,
  isCollapsed,
  onToggle,
  onClick,
  children,
}: {
  parent: any
  childrenLength: number
  isCollapsed: boolean
  onToggle: () => void
  onClick: () => void
  children: any[]
}) {
  // Check if any child has insufficient balance or allowance
  const hasChildWithWarning = children.some(
    (child) =>
      (child.orderParams?.hasEnoughBalance === false || child.orderParams?.hasEnoughAllowance === false) &&
      (child.order.status === OrderStatus.PENDING || child.order.status === OrderStatus.SCHEDULED),
  )

  // Get the first child with a warning to use its parameters
  const childWithWarning = hasChildWithWarning
    ? children.find(
        (child) =>
          (child.orderParams?.hasEnoughBalance === false || child.orderParams?.hasEnoughAllowance === false) &&
          (child.order.status === OrderStatus.PENDING || child.order.status === OrderStatus.SCHEDULED),
      )
    : null

  return (
    <TwapStatusAndToggleWrapper>
      <OrderStatusBox
        order={parent}
        onClick={onClick}
        withWarning={hasChildWithWarning}
        WarningTooltip={
          hasChildWithWarning && childWithWarning
            ? ({ children }) => (
                <WarningTooltip
                  children={children}
                  hasEnoughBalance={childWithWarning.orderParams.hasEnoughBalance ?? false}
                  hasEnoughAllowance={childWithWarning.orderParams.hasEnoughAllowance ?? false}
                  inputTokenSymbol={childWithWarning.order.inputToken.symbol || ''}
                  isOrderScheduled={childWithWarning.order.status === OrderStatus.SCHEDULED}
                  onApprove={() => childWithWarning.orderActions.approveOrderToken(childWithWarning.order.inputToken)}
                  showIcon={true}
                />
              )
            : undefined
        }
      />
      <styledEl.ToggleExpandButton onClick={onToggle} isCollapsed={isCollapsed}>
        {childrenLength && (
          <i>
            {childrenLength} part{childrenLength > 1 && 's'}
          </i>
        )}
        <button />
      </styledEl.ToggleExpandButton>
    </TwapStatusAndToggleWrapper>
  )
}

export interface TableGroupProps {
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

export function TableGroup(props: TableGroupProps) {
  const {
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
  } = props

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
  }

  // Create an array of child order data with their orderParams
  const childrenWithParams = children.map((child) => ({
    order: child,
    orderParams: getOrderParams(chainId, balancesAndAllowances, child),
    orderActions,
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
      >
        {isParentSigning ? undefined : (
          <TwapStatusAndToggle
            parent={parent}
            childrenLength={childrenLength}
            isCollapsed={isCollapsed}
            onToggle={() => setIsCollapsed((state) => !state)}
            onClick={() => orderActions.selectReceiptOrder(parent)}
            children={childrenWithParams}
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
