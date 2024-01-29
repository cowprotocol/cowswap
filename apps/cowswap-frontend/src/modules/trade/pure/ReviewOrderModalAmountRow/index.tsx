import { ReactNode } from 'react'

import { FiatAmount, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ConfirmDetailsItem } from '../ConfirmDetailsItem'

export type ReviewOrderAmountRowProps = {
  amount: Nullish<CurrencyAmount<Currency>>
  fiatAmount?: Nullish<CurrencyAmount<Currency>>
  tooltip?: ReactNode
  label: ReactNode
  isAmountAccurate?: boolean
  withTimelineDot?: boolean
}

export function ReviewOrderModalAmountRow({
  amount,
  fiatAmount,
  tooltip,
  label,
  isAmountAccurate = true,
  withTimelineDot = false,
}: ReviewOrderAmountRowProps) {
  return (
    <ConfirmDetailsItem tooltip={tooltip} label={label} withTimelineDot={withTimelineDot}>
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
