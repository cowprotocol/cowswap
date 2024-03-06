import React, { useState } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, Price } from '@uniswap/sdk-core'

import { transparentize } from 'color2k'
import styled from 'styled-components/macro'

import { OrderStatus } from 'legacy/state/orders/actions'

import { PendingOrderPrices } from 'modules/orders/state/pendingOrdersPricesAtom'
import { BalancesAndAllowances } from 'modules/tokens'

import { OrderRow } from './OrderRow'
import * as styledEl from './OrderRow/styled'
import { OrderActions } from './types'

import { ORDERS_TABLE_PAGE_SIZE } from '../../const/tabs'
import { getOrderParams } from '../../utils/getOrderParams'
import { OrderTableGroup } from '../../utils/orderTableGroupUtils'
import { OrdersTablePagination } from '../OrdersTablePagination'

const GroupBox = styled.div``

const Pagination = styled(OrdersTablePagination)`
  background: ${({ theme }) => transparentize(theme.text, 0.91)};
  margin: 0;
  padding: 10px 0;
`

export interface TableGroupProps {
  item: OrderTableGroup
  prices: PendingOrderPrices | undefined | null
  spotPrice: Price<Currency, Currency> | undefined | null
  isRateInverted: boolean
  isOpenOrdersTab: boolean
  isRowSelectable: boolean
  isRowSelected: boolean
  orderActions: OrderActions
  chainId: SupportedChainId
  balancesAndAllowances: BalancesAndAllowances
}

export function TableGroup(props: TableGroupProps) {
  const {
    item,
    prices,
    spotPrice,
    isRateInverted,
    isOpenOrdersTab,
    isRowSelectable,
    isRowSelected,
    orderActions,
    chainId,
    balancesAndAllowances,
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
    isOpenOrdersTab,
    spotPrice,
    prices,
    isRateInverted,
    orderActions,
  }

  return (
    <GroupBox>
      <OrderRow
        {...commonProps}
        key={parent.id}
        isRowSelected={isRowSelected}
        order={parent}
        orderParams={getOrderParams(chainId, balancesAndAllowances, parent)}
        onClick={() => orderActions.selectReceiptOrder(parent)}
      >
        {isParentSigning ? undefined : (
          <styledEl.ToggleExpandButton onClick={() => setIsCollapsed((state) => !state)} isCollapsed={isCollapsed}>
            {childrenLength && (
              <i>
                {childrenLength} part{childrenLength > 1 && 's'}
              </i>
            )}
            <button />
          </styledEl.ToggleExpandButton>
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
          {/*TODO: add styled to the paginator*/}
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
