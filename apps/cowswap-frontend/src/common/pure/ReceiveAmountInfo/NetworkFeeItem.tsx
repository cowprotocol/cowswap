import React, { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './styled'

interface NetworkFeeItemProps {
  discount: number
  isSell: boolean
  hasFee: boolean
  networkFeeAmount: CurrencyAmount<Currency> | undefined
  /** Test hook — most callers don't need one, only those an e2e test targets directly. */
  testId?: string
}

export function NetworkFeeItem({ discount, isSell, hasFee, networkFeeAmount, testId }: NetworkFeeItemProps): ReactNode {
  const typeString = !isSell ? '+' : '-'

  const hasNetworkFee = !!networkFeeAmount && networkFeeAmount.greaterThan(0)

  const FeePercent = (
    <span>
      <Trans>Network costs</Trans>
      {hasNetworkFee && discount ? ` [-${discount}%]` : ''}
    </span>
  )

  if (!networkFeeAmount) return null

  return (
    <div data-testid={testId}>
      {discount ? <styledEl.GreenText>{FeePercent}</styledEl.GreenText> : FeePercent}
      {hasFee ? (
        <span>
          {typeString}
          <TokenAmount amount={networkFeeAmount} tokenSymbol={networkFeeAmount?.currency} defaultValue="0" />
        </span>
      ) : (
        <styledEl.GreenText>
          <strong>
            <Trans>Free</Trans>
          </strong>
        </styledEl.GreenText>
      )}
    </div>
  )
}
