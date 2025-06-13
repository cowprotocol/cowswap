import { TokenAmount } from '@cowprotocol/ui'
import { TokenSymbol } from '@cowprotocol/ui'
import { Fraction } from '@uniswap/sdk-core'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

interface Props {
  order: ParsedOrder
  price: Fraction | null
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
