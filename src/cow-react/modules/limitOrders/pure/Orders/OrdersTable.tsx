import { Order } from 'state/orders/actions'
import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { useEffect, useState } from 'react'
import { OrdersTablePagination } from './OrdersTablePagination'
import { OrderRow } from './OrderRow'
import { InvertRateControl } from '@cow/common/pure/RateInfo'
import { BalancesAndAllowances } from '../../containers/OrdersWidget/hooks/useOrdersBalancesAndAllowances'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { transparentize } from 'polished'

const TableBox = styled.div`
  display: block;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};
  padding: 0 0 24px;
`

const Header = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr)) 114px 70px;
  align-items: center;
  border-top: 1px solid transparent;
  border-bottom: 1px solid ${({ theme }) => transparentize(0.8, theme.text3)};

  > div {
    padding: 12px 16px;
    overflow: hidden;
    font-size: 13px;
    font-weight: 400;
  }
`

const RowElement = styled(Header)`
  background: transparent;
  transition: background 0.15s ease-in-out;

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
`

export interface OrdersTableProps {
  chainId: SupportedChainId | undefined
  orders: Order[]
  balancesAndAllowances: BalancesAndAllowances
  showOrderCancelationModal(order: Order): void
}

const pageSize = 10

export function OrdersTable({ chainId, orders, balancesAndAllowances, showOrderCancelationModal }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [isRateInversed, setIsRateInversed] = useState(false)

  const step = currentPage * pageSize
  const ordersPage = orders.slice(step - pageSize, step)

  useEffect(() => {
    setCurrentPage(1)
  }, [orders])

  return (
    <>
      <TableBox>
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
            <InvertRateControl onClick={() => setIsRateInversed(!isRateInversed)} />
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
              chainId={chainId}
              order={order}
              RowElement={RowElement}
              isRateInversed={isRateInversed}
              balancesAndAllowances={balancesAndAllowances}
              showOrderCancelationModal={showOrderCancelationModal}
            />
          ))}
        </Rows>
      </TableBox>
      <OrdersTablePagination
        pageSize={pageSize}
        totalCount={orders.length}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
    </>
  )
}
