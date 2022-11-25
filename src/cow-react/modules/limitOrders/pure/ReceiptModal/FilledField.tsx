import { useMemo } from 'react'
import * as styledEl from './styled'
import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { formatSmart } from 'utils/format'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'

interface Props {
  order: ParsedOrder
  sellAmount: CurrencyAmount<Token>
  buyAmount: CurrencyAmount<Token>
}

export function FilledField({ order, sellAmount, buyAmount }: Props) {
  const { inputToken, outputToken } = order

  const filledPercentage = useMemo(() => {
    if (!order || !order.filledPercentage) {
      return null
    }

    return order.filledPercentage.times('100').decimalPlaces(2).toString()
  }, [order])

  return (
    <styledEl.Value>
      <styledEl.InlineWrapper>
        <styledEl.Progress active={filledPercentage || 0} />
        <styledEl.ProgressPercent>{filledPercentage}%</styledEl.ProgressPercent>
      </styledEl.InlineWrapper>

      <styledEl.InlineWrapper>
        <strong title={`${sellAmount.toExact()} ${inputToken.symbol}`}>
          {formatSmart(sellAmount)} {inputToken.symbol}
        </strong>
        <span style={{ margin: '0 5px' }}>sold for</span>
        <strong title={`${buyAmount.toExact()} ${outputToken.symbol}`}>
          {formatSmart(buyAmount)} {outputToken.symbol}
        </strong>
      </styledEl.InlineWrapper>
    </styledEl.Value>
  )
}
