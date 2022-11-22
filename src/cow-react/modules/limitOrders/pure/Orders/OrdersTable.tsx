import { Order, OrderStatus } from 'state/orders/actions'
import { Currency, CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { Trans } from '@lingui/macro'
import { useEffect, useState } from 'react'
import { OrdersTablePagination } from './OrdersTablePagination'
import { formatSmart } from 'utils/format'
import styled from 'styled-components/macro'
import CurrencyLogo from 'components/CurrencyLogo'

const statusColorMap: { [key in OrderStatus]: string } = {
  [OrderStatus.PENDING]: '#badbe8',
  [OrderStatus.PRESIGNATURE_PENDING]: '#badbe8',
  [OrderStatus.EXPIRED]: '#eeaaaa',
  [OrderStatus.FULFILLED]: '#d5eab3',
  [OrderStatus.CANCELLED]: '#fcecb4',
  // TODO: decide what color for each state
  [OrderStatus.CREATING]: '#badbe8',
  [OrderStatus.REFUNDED]: '#eeaaaa',
  [OrderStatus.REFUNDING]: '#eeaaaa',
  [OrderStatus.REJECTED]: '#eeaaaa',
}

const TableBox = styled.div`
  display: block;
  border-radius: 16px;
  border: 2px solid ${({ theme }) => theme.border2};
`

const Header = styled.div`
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
`

const Rows = styled.div`
  display: block;
`

const Row = styled(Header)`
  :last-child {
    border-bottom: 0;
  }
`

const StatusItem = styled.div<{ status: OrderStatus; cancelling: boolean }>`
  display: inline-block;
  background: ${({ status, cancelling }) => (cancelling ? statusColorMap.cancelled : statusColorMap[status])};
  color: ${({ theme }) => theme.text2};
  padding: 5px 10px;
  border-radius: 3px;
`

const AmountItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  white-space: nowrap;
`

const RateValue = styled.span`
  font-size: 12px;
`

export function CurrencyAmountItem({ amount }: { amount: CurrencyAmount<Currency> }) {
  return (
    <AmountItem title={amount.toExact() + ' ' + amount.currency.symbol}>
      <div>
        <CurrencyLogo currency={amount.currency} size="24px" />
      </div>
      <span>{formatSmart(amount)}</span>
      <span>{amount.currency.symbol}</span>
    </AmountItem>
  )
}

export interface OrdersTableProps {
  orders: Order[]
}

const orderStatusTitleMap: { [key in OrderStatus]: string } = {
  [OrderStatus.PENDING]: 'Open',
  [OrderStatus.PRESIGNATURE_PENDING]: 'Signing',
  [OrderStatus.FULFILLED]: 'Filled',
  [OrderStatus.EXPIRED]: 'Expired',
  [OrderStatus.CANCELLED]: 'Cancelled',
  [OrderStatus.CREATING]: 'Creating',
  [OrderStatus.REFUNDED]: 'Expired',
  [OrderStatus.REFUNDING]: 'Expired',
  [OrderStatus.REJECTED]: 'Expired',
}

const pageSize = 10

export function OrdersTable({ orders }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

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
            <Trans>Limit price</Trans>
          </div>
          <div>
            <Trans>Status</Trans>
          </div>
        </Header>
        <Rows>
          {ordersPage.map((order) => {
            const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
            const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())
            const price = new Fraction(order.buyAmount.toString(), order.sellAmount.toString())

            return (
              <Row key={order.id}>
                <div>
                  <CurrencyAmountItem amount={sellAmount} />
                </div>
                <div>
                  <CurrencyAmountItem amount={buyAmount} />
                </div>
                <div>
                  <RateValue>
                    1 {order.inputToken.symbol} ={' '}
                    <span title={price.toSignificant(18) + ' ' + order.outputToken.symbol}>
                      {formatSmart(price)} {order.outputToken.symbol}
                    </span>
                  </RateValue>
                </div>
                <div>
                  <StatusItem cancelling={!!order.isCancelling} status={order.status}>
                    {order.isCancelling ? 'Cancelling...' : orderStatusTitleMap[order.status]}
                  </StatusItem>
                </div>
              </Row>
            )
          })}
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
