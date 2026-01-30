import { ReactElement } from 'react'

import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import { getFeeToken } from '../../../shared/utils/getFeeToken'
import * as styledEl from '../ReceiptModal.styled'

export type Props = { order: ParsedOrder }

export function FeeField({ order }: Props): ReactElement | null {
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
