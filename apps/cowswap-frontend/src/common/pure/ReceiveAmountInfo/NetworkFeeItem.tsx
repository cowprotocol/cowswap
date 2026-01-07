import React, { ReactNode } from 'react'

import { TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './styled'

interface NetworkFeeItemProps {
  discount: number
  isSell: boolean
  hasFee: boolean
  networkFeeAmount: CurrencyAmount<Currency> | undefined
}

export function NetworkFeeItem({ discount, isSell, hasFee, networkFeeAmount }: NetworkFeeItemProps): ReactNode {
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
    <div>
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
