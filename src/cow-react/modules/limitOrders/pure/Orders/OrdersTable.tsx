import { Order, OrderStatus } from 'state/orders/actions'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { Trans } from '@lingui/macro'
import * as styledEl from './OrdersTable.styled'
import { useEffect, useState } from 'react'
import { OrdersTablePagination } from './OrdersTablePagination'
import { formatSmart } from 'utils/format'

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
      <styledEl.TableBox>
        <styledEl.Header>
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
        </styledEl.Header>
        <styledEl.Rows>
          {ordersPage.map((order) => {
            const sellAmount = CurrencyAmount.fromRawAmount(order.inputToken, order.sellAmount.toString())
            const buyAmount = CurrencyAmount.fromRawAmount(order.outputToken, order.buyAmount.toString())
            const price = new Fraction(order.buyAmount.toString(), order.sellAmount.toString())

            return (
              <styledEl.Row key={order.id}>
                <div>
                  <styledEl.CurrencyAmountItem amount={sellAmount} />
                </div>
                <div>
                  <styledEl.CurrencyAmountItem amount={buyAmount} />
                </div>
                <div>
                  <styledEl.RateValue>
                    1 {order.inputToken.symbol} ={' '}
                    <span title={price.toSignificant(18) + ' ' + order.outputToken.symbol}>
                      {formatSmart(price)} {order.outputToken.symbol}
                    </span>
                  </styledEl.RateValue>
                </div>
                <div>
                  <styledEl.StatusItem cancelling={!!order.isCancelling} status={order.status}>
                    {order.isCancelling ? 'Cancelling...' : orderStatusTitleMap[order.status]}
                  </styledEl.StatusItem>
                </div>
              </styledEl.Row>
            )
          })}
        </styledEl.Rows>
      </styledEl.TableBox>

      {/* Only show pagination if more than 1 page available */}
      {orders.length > pageSize && (
        <OrdersTablePagination
          pageSize={pageSize}
          totalCount={orders.length}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </>
  )
}
