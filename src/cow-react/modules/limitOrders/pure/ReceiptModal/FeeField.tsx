import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { formatSmart } from 'utils/format'
import { CurrencyAmount, Token } from '@uniswap/sdk-core'
import * as styledEl from './styled'

export type Props = { order: ParsedOrder }

export function FeeField({ order }: Props): JSX.Element | null {
  const { executedFeeAmount, executedSurplusFee, inputToken, sellToken } = order

  let formattedExecutedFee: string | undefined = executedSurplusFee || executedFeeAmount
  let quoteSymbol: string | undefined = sellToken
  let totalFeel: CurrencyAmount<Token> | undefined

  if (sellToken) {
    const executedFeeCurrency = CurrencyAmount.fromRawAmount(inputToken, executedFeeAmount || 0)
    const executedSurplusFeeCurrency = CurrencyAmount.fromRawAmount(inputToken, executedSurplusFee || 0)
    totalFeel = executedFeeCurrency.add(executedSurplusFeeCurrency)
    formattedExecutedFee = formatSmart(totalFeel)
    quoteSymbol = inputToken.symbol
  }

  return (
    <styledEl.Value>
      {!quoteSymbol || !formattedExecutedFee ? (
        <span>-</span>
      ) : (
        <span title={`${totalFeel?.toExact()} ${quoteSymbol}`}>
          {formattedExecutedFee} {quoteSymbol}
        </span>
      )}
    </styledEl.Value>
  )
}
