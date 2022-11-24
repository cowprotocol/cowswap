import { ParsedOrder } from '@cow/modules/limitOrders/containers/OrdersWidget/hooks/useLimitOrdersList'
import { formatSmart } from 'utils/format'
import { CurrencyAmount } from '@uniswap/sdk-core'
import * as styledEl from './styled'

export type Props = { order: ParsedOrder }

export function FeeField({ order }: Props): JSX.Element | null {
  const { executedFeeAmount, inputToken, sellToken } = order

  let formattedExecutedFee: string | undefined = executedFeeAmount?.toString(10) || ''
  let quoteSymbol: string | undefined = sellToken

  if (sellToken) {
    formattedExecutedFee = formatSmart(CurrencyAmount.fromRawAmount(inputToken, executedFeeAmount?.toString() || 0))
    quoteSymbol = inputToken.symbol
  }

  if (!quoteSymbol) {
    return null
  }

  return (
    <styledEl.Value>
      <span>
        {formattedExecutedFee} {quoteSymbol}
      </span>
    </styledEl.Value>
  )
}
