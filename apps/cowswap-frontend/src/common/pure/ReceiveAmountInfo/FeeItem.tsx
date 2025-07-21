import React, { ReactNode } from 'react'

import { TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Trans } from '@lingui/macro'

import * as styledEl from './styled'

interface FeeItemProps {
  isSell: boolean
  partnerFeeAmount: CurrencyAmount<Currency> | undefined
}

export function FeeItem({ isSell, partnerFeeAmount }: FeeItemProps): ReactNode {
  const typeString = !isSell ? '+' : '-'
  const hasPartnerFee = !!partnerFeeAmount && partnerFeeAmount.greaterThan(0)

  return (
    <div>
      <span>
        <Trans>Fee</Trans>
      </span>
      {hasPartnerFee ? (
        <span>
          {typeString}
          <TokenAmount amount={partnerFeeAmount} tokenSymbol={partnerFeeAmount?.currency} defaultValue="0" />
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
