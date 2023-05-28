import { Fraction } from '@uniswap/sdk-core'

import { ParsedOrder } from 'modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'

import { TokenAmount } from 'common/pure/TokenAmount'
import { TokenSymbol } from 'common/pure/TokenSymbol'

import * as styledEl from './styled'

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
