import { Order } from 'state/orders/actions'
import { Trans } from '@lingui/macro'
import styled from 'styled-components/macro'
import { useEffect, useState } from 'react'
import { OrdersTablePagination } from './OrdersTablePagination'
import { OrderRow } from './OrderRow'
import { InvertRateControl, RateInfo } from '../../pure/RateInfo'
import { ActiveRateDisplay } from '../../hooks/useActiveRateDisplay'

const TableBox = styled.div`
  display: block;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.border2};
`

const RowElement = styled.div`
  display: grid;
  grid-gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  border-bottom: 2px solid ${({ theme }) => theme.border2};

  > div {
    padding: 12px;
    overflow: hidden;
    font-size: 14px;
  }

  :last-child {
    border-bottom: 0;
  }
`

const Header = styled(RowElement)`
  border-bottom: 2px solid ${({ theme }) => theme.border2};
`

const Rows = styled.div`
  display: block;
`

export interface OrdersTableProps {
  orders: Order[]
}

const pageSize = 10

export function OrdersTable({ orders }: OrdersTableProps) {
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
        </Header>
        <Rows>
          {ordersPage.map((order) => (
            <OrderRow key={order.id} order={order} RowElement={RowElement} />
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
