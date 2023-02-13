import * as styledEl from './styled'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { Fraction } from '@uniswap/sdk-core'
import { TokenSymbol } from '@cow/common/pure/TokenSymbol'
import { TokenAmount } from '@cow/common/pure/TokenAmount'

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
