import * as styledEl from './styled'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { Fraction } from '@uniswap/sdk-core'
import { formatSmart } from 'utils/format'

interface Props {
  order: ParsedOrder
  price: Fraction | null
}

export function PriceField({ order, price }: Props) {
  return (
    <styledEl.Value>
      {price ? (
        <styledEl.RateValue>
          1 {order.inputToken.symbol} ={' '}
          <span title={price.toSignificant(18) + ' ' + order.outputToken.symbol}>
            {formatSmart(price)} {order.outputToken.symbol}
          </span>
        </styledEl.RateValue>
      ) : (
        '-'
      )}
    </styledEl.Value>
  )
}
