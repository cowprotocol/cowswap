import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

export type Props = { order: ParsedOrder }

// TODO: get rid of this once https://github.com/cowprotocol/services/pull/3184 is complete
const HAS_BACKEND_MIGRATED = false

function getFeeToken(order: ParsedOrder) {
  if (!HAS_BACKEND_MIGRATED) {
    return order.inputToken
  }

  const { inputToken, outputToken } = order
  const { executedFeeToken } = order.executionData

  if (inputToken?.address.toLowerCase() === executedFeeToken?.toLowerCase()) {
    return inputToken
  }
  if (outputToken?.address.toLowerCase() === executedFeeToken?.toLowerCase()) {
    return outputToken
  }
  return undefined
}

export function FeeField({ order }: Props): JSX.Element | null {
  const { totalFee } = order.executionData
  const feeToken = getFeeToken(order)

  if (!feeToken) return <styledEl.Value></styledEl.Value>

  const totalFeeAmount = CurrencyAmount.fromRawAmount(feeToken, totalFee || 0)
  const quoteSymbol = feeToken.symbol

  return (
    <styledEl.Value>
      {!quoteSymbol || !totalFee ? (
        <span>-</span>
      ) : (
        <span>
          <TokenAmount amount={totalFeeAmount} tokenSymbol={feeToken} />
        </span>
      )}
    </styledEl.Value>
  )
}
