import * as styledEl from './styled'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { Fraction } from '@uniswap/sdk-core'
import { formatSmart } from '@cow/utils/format'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'

interface Props {
  order: ParsedOrder
  price: Fraction | null
}

export function PriceField({ order, price }: Props) {
  return (
    <styledEl.Value>
      {price ? (
        <styledEl.RateValue>
          1 {<TokenSymbol token={order.inputToken} />} ={' '}
          <span title={price.toSignificant(18) + ' ' + order.outputToken.symbol}>
            {formatSmart(price)} <TokenSymbol token={order.outputToken} />
          </span>
        </styledEl.RateValue>
      ) : (
        '-'
      )}
    </styledEl.Value>
  )
}
