import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useLingui } from '@lingui/react/macro'
import { Nullish } from 'types'

import { ReviewOrderModalAmountRow } from '../ReviewOrderModalAmountRow'

interface TotalFeeRowProps {
  totalFeeUsd: Nullish<CurrencyAmount<Currency>>
}

export function TotalFeeRow({ totalFeeUsd }: TotalFeeRowProps): ReactNode {
  const { t } = useLingui()
  return <ReviewOrderModalAmountRow fiatAmount={totalFeeUsd} label={t`Total fee`} />
}
