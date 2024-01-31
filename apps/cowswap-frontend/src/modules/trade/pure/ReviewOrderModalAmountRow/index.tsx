import { ReactNode } from 'react'

import { FiatAmount, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'
import { Nullish } from 'types'

import { ConfirmDetailsItem } from '../ConfirmDetailsItem'
import { ReceiveAmountTitle } from '../ReceiveAmountTitle'

const ReceiveAmountTitleStyled = styled(ReceiveAmountTitle)`
  margin-left: -2px;
  margin-top: 3px;
`

export type ReviewOrderAmountRowProps = {
  amount: Nullish<CurrencyAmount<Currency>>
  fiatAmount?: Nullish<CurrencyAmount<Currency>>
  tooltip?: ReactNode
  label: ReactNode
  children?: ReactNode
  isAmountAccurate?: boolean
  withTimelineDot?: boolean
  highlighted?: boolean
}

export function ReviewOrderModalAmountRow({
  amount,
  fiatAmount,
  tooltip,
  label,
  isAmountAccurate = true,
  withTimelineDot = false,
  highlighted = false,
}: ReviewOrderAmountRowProps) {
  const Amount = (
    <>
      {!isAmountAccurate && '≈ '}
      <TokenAmount amount={amount} defaultValue="-" tokenSymbol={amount?.currency} />
      {fiatAmount && (
        <i>
          &nbsp;(
          <FiatAmount amount={fiatAmount} />)
        </i>
      )}
    </>
  )

  return (
    <ConfirmDetailsItem tooltip={tooltip} label={highlighted ? undefined : label} withTimelineDot={withTimelineDot}>
      {highlighted ? (
        <>
          <ReceiveAmountTitleStyled>{label}</ReceiveAmountTitleStyled>
          <strong>{Amount}</strong>
        </>
      ) : (
        Amount
      )}
    </ConfirmDetailsItem>
  )
}
