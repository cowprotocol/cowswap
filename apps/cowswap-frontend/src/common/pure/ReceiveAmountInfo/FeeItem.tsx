import React, { ReactNode } from 'react'

import { isFractionFalsy } from '@cowprotocol/common-utils'
import { CenteredDots, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/react/macro'

import * as styledEl from './styled'

interface FeeItemProps {
  title: string
  isSell: boolean
  feeAmount: CurrencyAmount<Currency> | undefined
  loading?: boolean
}

export function FeeItem({ title, isSell, feeAmount: feeAmount, loading }: FeeItemProps): ReactNode {
  const typeString = !isSell ? '+' : '-'

  return (
    <div>
      <span>{title}</span>
      {!isFractionFalsy(feeAmount) ? (
        <span>
          {typeString}
          <TokenAmount amount={feeAmount} tokenSymbol={feeAmount?.currency} defaultValue="0" />
        </span>
      ) : loading ? (
        <CenteredDots />
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
