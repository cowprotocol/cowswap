import { ReactNode } from 'react'

import { FractionUtils } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useLingui } from '@lingui/react/macro'
import { Nullish } from 'types'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface TotalFeeRowProps {
  totalFeeAmount: Nullish<CurrencyAmount<Currency>>
  totalFeeUsd: Nullish<CurrencyAmount<Currency>>
  withTimelineDot: boolean
}

export function TotalFeeRow({ totalFeeUsd, withTimelineDot, totalFeeAmount }: TotalFeeRowProps): ReactNode {
  const { t } = useLingui()

  if (!totalFeeAmount || totalFeeAmount.equalTo(0)) {
    return null
  }

  const minTotalFeeAmount = FractionUtils.amountToAtLeastOneWei(totalFeeAmount)

  if (!minTotalFeeAmount || minTotalFeeAmount.equalTo(0)) {
    return null
  }

  return <ReviewOrderModalAmountRow withTimelineDot={withTimelineDot} fiatAmount={totalFeeUsd} label={t`Total fee`} />
}
