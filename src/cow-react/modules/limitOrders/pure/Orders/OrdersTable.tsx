import { Order } from 'state/orders/actions'
import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { useState } from 'react'
import { OrdersTablePagination } from './OrdersTablePagination'
import { OrderRow } from './OrderRow'
import { InvertRateControl } from '@cow/common/pure/RateInfo'
import { BalancesAndAllowances } from '../../containers/OrdersWidget/hooks/useOrdersBalancesAndAllowances'
import { useSelectReceiptOrder } from '@cow/modules/limitOrders/containers/OrdersReceiptModal/hooks'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { transparentize } from 'polished'
import { LIMIT_ORDERS_PAGE_SIZE } from '@cow/modules/limitOrders/const/limitOrdersTabs'
import { getOrderParams } from './utils/getOrderParams'
import { ordersSorter } from '@cow/modules/limitOrders/utils/ordersSorter'

const TableBox = styled.div`
  display: block;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};
  padding: 0;
  position: relative;
  overflow: hidden;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    display: flex;
    flex-flow: column wrap;
  `};
`

const TableInner = styled.div`
  display: block;
  width: inherit;
  height: inherit;
  padding: 0 0 24px;
  overflow-y: hidden;
  overflow-x: auto; // fallback for 'overlay'
  overflow-x: overlay;
  ${({ theme }) => theme.colorScrollbar};
`

const Header = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(2, minmax(150px, 1fr)) minmax(150px, 1.5fr) 120px 36px;
  align-items: center;
  border-top: 1px solid transparent;
  border-bottom: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};
  padding: 0 16px;

  > div {
    padding: 12px 0;
    font-size: 13px;
    font-weight: 400;
  }
`

const RowElement = styled(Header)`
  background: transparent;
  transition: background 0.15s ease-in-out;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => transparentize(0.9, theme.text3)};
  }

  > div {
    font-size: 13px;
  }

  &:last-child {
    border-bottom: 0;
  }
`

const Rows = styled.div`
  display: block;
  ${({ theme }) => theme.colorScrollbar};

  ${({ theme }) => theme.mediaWidth.upToMedium`
   display: flex;
   flex-flow: column wrap;
  `};
`

const StyledInvertRateControl = styled(InvertRateControl)`
  display: inline-flex;
  margin-left: 5px;
`

export interface OrdersTableProps {
  currentPageNumber: number
  chainId: SupportedChainId | undefined
  orders: Order[]
  balancesAndAllowances: BalancesAndAllowances
  getShowCancellationModal(order: Order): (() => void) | null
}

export function OrdersTable({
  chainId,
  orders,
  balancesAndAllowances,
  getShowCancellationModal,
  currentPageNumber,
}: OrdersTableProps) {
  const [isRateInversed, setIsRateInversed] = useState(false)

  const selectReceiptOrder = useSelectReceiptOrder()
  const step = currentPageNumber * LIMIT_ORDERS_PAGE_SIZE
  const ordersPage = orders.slice(step - LIMIT_ORDERS_PAGE_SIZE, step).sort(ordersSorter)

  return (
    <>
      <TableBox>
        <TableInner>
          <Header>
            <div>
              <Trans>Sell</Trans>
            </div>
            <div>
              <Trans>Receive</Trans>
            </div>
            <div>
              <span>
                <Trans>Limit price</Trans>
              </span>
              <StyledInvertRateControl onClick={() => setIsRateInversed(!isRateInversed)} />
            </div>
            <div>
              <Trans>Status</Trans>
            </div>
            <div>{/*Cancel order column*/}</div>
          </Header>
          <Rows>
            {ordersPage.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                orderParams={getOrderParams(chainId, balancesAndAllowances, order)}
                RowElement={RowElement}
                isRateInversed={isRateInversed}
                getShowCancellationModal={getShowCancellationModal}
                onClick={() => selectReceiptOrder(order.id)}
              />
            ))}
          </Rows>
        </TableInner>
      </TableBox>

      {/* Only show pagination if more than 1 page available */}
      {orders.length > LIMIT_ORDERS_PAGE_SIZE && (
        <OrdersTablePagination
          pageSize={LIMIT_ORDERS_PAGE_SIZE}
          totalCount={orders.length}
          currentPage={currentPageNumber}
        />
      )}
    </>
  )
}
