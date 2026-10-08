import React, { ReactNode } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { TokenAmount } from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './styled'

import { ThreeDots } from '../ThreeDots/ThreeDots.pure'

interface FeeItemProps {
  title: string
  isSell: boolean
  feeAmount: CurrencyAmount<Currency> | undefined
  loading?: boolean
  /** Test hook — most callers don't need one, only those an e2e test targets directly. */
  testId?: string
}

export function FeeItem({ title, isSell, feeAmount: feeAmount, loading, testId }: FeeItemProps): ReactNode {
  const typeString = !isSell ? '+' : '-'

  return (
    <div data-testid={testId}>
      <span>{title}</span>
      {!isFractionFalsy(feeAmount) ? (
        <span>
          {typeString}
          <TokenAmount amount={feeAmount} tokenSymbol={feeAmount?.currency} defaultValue="0" />
        </span>
      ) : loading ? (
        <ThreeDots centered />
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
