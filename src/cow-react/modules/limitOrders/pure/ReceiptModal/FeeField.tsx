import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { formatSmart } from 'utils/format'
import { CurrencyAmount } from '@uniswap/sdk-core'
import * as styledEl from './styled'

export type Props = { order: ParsedOrder }

export function FeeField({ order }: Props): JSX.Element | null {
  const { executedFeeAmount, executedSurplusFee, inputToken, sellToken } = order

  if (!sellToken) return <styledEl.Value></styledEl.Value>

  // TODO: use the value from SDK
  const totalFee = CurrencyAmount.fromRawAmount(inputToken, (executedSurplusFee ?? executedFeeAmount) || 0)
  const formattedExecutedFee = formatSmart(totalFee)
  const quoteSymbol = inputToken.symbol

  return (
    <styledEl.Value>
      {!quoteSymbol || !formattedExecutedFee ? (
        <span>-</span>
      ) : (
        <span title={`${totalFee?.toExact()} ${quoteSymbol}`}>
          {formattedExecutedFee} {quoteSymbol}
        </span>
      )}
    </styledEl.Value>
  )
}
