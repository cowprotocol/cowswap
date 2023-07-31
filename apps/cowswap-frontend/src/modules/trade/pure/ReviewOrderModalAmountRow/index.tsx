import { ReactNode } from 'react'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { FiatAmount } from 'common/pure/FiatAmount'
import { TokenAmount } from 'common/pure/TokenAmount'

import { ConfirmDetailsItem } from '../ConfirmDetailsItem'

export type ReviewOrderAmountRowProps = {
  amount: Nullish<CurrencyAmount<Currency>>
  fiatAmount?: Nullish<CurrencyAmount<Currency>>
  tooltip?: ReactNode
  label: ReactNode
  isAmountAccurate?: boolean
}

export function ReviewOrderModalAmountRow({
  amount,
  fiatAmount,
  tooltip,
  label,
  isAmountAccurate = true,
}: ReviewOrderAmountRowProps) {
  return (
    <ConfirmDetailsItem tooltip={tooltip} label={label}>
      {!isAmountAccurate && '≈ '}
      <TokenAmount amount={amount} defaultValue="-" tokenSymbol={amount?.currency} />
      {fiatAmount && (
        <i>
          &nbsp;(
          <FiatAmount amount={fiatAmount} />)
        </i>
      )}
    </ConfirmDetailsItem>
  )
}
