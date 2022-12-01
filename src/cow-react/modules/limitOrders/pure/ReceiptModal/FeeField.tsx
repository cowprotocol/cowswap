import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { formatSmart } from 'utils/format'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import * as styledEl from './styled'

export type Props = { order: ParsedOrder }

export function FeeField({ order }: Props): JSX.Element | null {
  const { executedFeeAmount, inputToken, sellToken } = order

  let formattedExecutedFee: string | undefined = executedFeeAmount
  let quoteSymbol: string | undefined = sellToken
  let executedFeeCurrency: CurrencyAmount<Token> | undefined

  if (sellToken) {
    executedFeeCurrency = CurrencyAmount.fromRawAmount(inputToken, executedFeeAmount || 0)
    formattedExecutedFee = formatSmart(executedFeeCurrency)
    quoteSymbol = inputToken.symbol
  }

  return (
    <styledEl.Value>
      {!quoteSymbol || !formattedExecutedFee ? (
        <span>-</span>
      ) : (
        <span title={`${executedFeeCurrency?.toExact()} ${quoteSymbol}`}>
          {formattedExecutedFee} {quoteSymbol}
        </span>
      )}
    </styledEl.Value>
  )
}
