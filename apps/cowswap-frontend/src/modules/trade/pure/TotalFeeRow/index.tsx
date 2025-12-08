import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/macro'
import { Nullish } from 'types'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface TotalFeeRowProps {
  totalFeeUsd: Nullish<CurrencyAmount<Currency>>
  withTimelineDot?: boolean
}

export function TotalFeeRow({ totalFeeUsd, withTimelineDot }: TotalFeeRowProps): ReactNode {
  return <ReviewOrderModalAmountRow withTimelineDot={withTimelineDot} fiatAmount={totalFeeUsd} label={t`Total fee`} />
}
