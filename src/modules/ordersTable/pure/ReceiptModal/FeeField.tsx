import { CurrencyAmount } from '@uniswap/sdk-core'

import { TokenAmount } from 'common/pure/TokenAmount'
import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

export type Props = { order: ParsedOrder }

export function FeeField({ order }: Props): JSX.Element | null {
  const { executedFeeAmount, executedSurplusFee, inputToken, sellToken } = order

  if (!sellToken) return <styledEl.Value></styledEl.Value>

  // TODO: use the value from SDK
  const totalFee = CurrencyAmount.fromRawAmount(inputToken, (executedSurplusFee ?? executedFeeAmount) || 0)
  const quoteSymbol = inputToken.symbol

  return (
    <styledEl.Value>
      {!quoteSymbol || !totalFee ? (
        <span>-</span>
      ) : (
        <span>
          <TokenAmount amount={totalFee} tokenSymbol={inputToken} />
        </span>
      )}
    </styledEl.Value>
  )
}
