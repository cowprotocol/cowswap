import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { OrderKind } from 'state/orders/actions'
import * as styledEl from './styled'
import { CurrencyAmount } from '@uniswap/sdk-core'
import { TokenAmount } from '@cow/common/pure/TokenAmount'

interface Props {
  order: ParsedOrder
}

export function SurplusField({ order }: Props) {
  const { kind, inputToken, outputToken, surplusAmount, surplusPercentage } = order

  const surplusToken = kind === OrderKind.SELL ? outputToken : inputToken

  if (!surplusToken || !surplusAmount || surplusAmount?.isZero()) {
    return <styledEl.Value>-</styledEl.Value>
  }

  const parsedSurplus = CurrencyAmount.fromRawAmount(surplusToken, surplusAmount?.toNumber())
  const formattedPercent = surplusPercentage?.multipliedBy(100)?.toFixed(2)

  return (
    <styledEl.Value title={`${parsedSurplus.toExact()} ${surplusToken.symbol}`}>
      <styledEl.InlineWrapper>
        <styledEl.Surplus>+{formattedPercent}%</styledEl.Surplus>
        <span>
          <TokenAmount amount={parsedSurplus} tokenSymbol={surplusToken} />
        </span>
      </styledEl.InlineWrapper>
    </styledEl.Value>
  )
}
