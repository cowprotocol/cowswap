import * as styledEl from './styled'
import { ParsedOrder } from 'modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { Fraction } from '@uniswap/sdk-core'
import { TokenSymbol } from 'common/pure/TokenSymbol'
import { TokenAmount } from 'common/pure/TokenAmount'

interface Props {
  order: ParsedOrder
  price: Fraction | null
}

export function PriceField({ order, price }: Props) {
  return (
    <styledEl.Value>
      {price ? (
        <styledEl.RateValue>
          1 {<TokenSymbol token={order.inputToken} />} = <TokenAmount amount={price} tokenSymbol={order.outputToken} />
        </styledEl.RateValue>
      ) : (
        '-'
      )}
    </styledEl.Value>
  )
}
