import { Order } from 'state/orders/actions'
import { CurrencyAmount, Fraction } from '@uniswap/sdk-core'
import { Trans } from '@lingui/macro'
import * as styledEl from './OrdersTable.styled'

export interface OrdersTableProps {
  orders: Order[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
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
          {orders.map((order) => {
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
                  1 {order.inputToken.symbol} = {price.toSignificant(6)} {order.outputToken.symbol}
                </div>
                <div>
                  <styledEl.StatusItem status={order.status}>{order.status}</styledEl.StatusItem>
                </div>
              </styledEl.Row>
            )
          })}
        </styledEl.Rows>
      </styledEl.TableBox>
    </>
  )
}
