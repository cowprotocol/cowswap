import { ReactElement } from 'react'

import { TokenAmount } from '@cowprotocol/ui'
import { CurrencyAmount } from '@uniswap/sdk-core'

import { getFeeToken } from 'modules/ordersTable/utils/getFeeToken'

import { ParsedOrder } from 'utils/orderUtils/parseOrder'

import * as styledEl from './styled'

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
