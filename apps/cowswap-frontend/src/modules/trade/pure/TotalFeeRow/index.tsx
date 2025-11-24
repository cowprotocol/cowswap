import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { t } from '@lingui/macro'
import { Nullish } from 'types'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface TotalFeeRowProps {
  totalFeeUsd: Nullish<CurrencyAmount<Currency>>
}

export function TotalFeeRow({ totalFeeUsd }: TotalFeeRowProps): ReactNode {
  return <ReviewOrderModalAmountRow fiatAmount={totalFeeUsd} label={t`Total fee`} />
}
