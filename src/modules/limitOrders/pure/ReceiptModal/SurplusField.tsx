import { OrderKind } from '@cowprotocol/cow-sdk'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { ParsedOrder } from 'modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'

import { TokenAmount } from 'common/pure/TokenAmount'

import * as styledEl from './styled'

interface Props {
  order: ParsedOrder
}

export function SurplusField({ order }: Props) {
  const { kind, inputToken, outputToken, surplusAmount, surplusPercentage } = order

  const surplusToken = kind === OrderKind.SELL ? outputToken : inputToken

  if (!surplusToken || !surplusAmount || surplusAmount?.isZero()) {
    return <styledEl.Value>-</styledEl.Value>
  }

  const parsedSurplus = CurrencyAmount.fromRawAmount(surplusToken, surplusAmount?.decimalPlaces(0).toFixed())
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
