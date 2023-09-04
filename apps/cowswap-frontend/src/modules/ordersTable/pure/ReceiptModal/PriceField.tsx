import { TokenAmount } from '@cowswap/ui'
import { TokenSymbol } from '@cowswap/ui'
import { Fraction } from '@uniswap/sdk-core'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

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
