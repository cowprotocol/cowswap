import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

export type Props = { order: ParsedOrder }

export function FeeField({ order }: Props): JSX.Element | null {
  const { inputToken } = order
  const { executedFeeAmount, executedSurplusFee } = order.executionData

  if (!inputToken) return <styledEl.Value></styledEl.Value>

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
