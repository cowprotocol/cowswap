import { ReactNode } from 'react'

import { FiatAmount, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { Content } from 'modules/trade/pure/ConfirmDetailsItem/styled'

import { ConfirmDetailsItem } from '../ConfirmDetailsItem'
import { ReceiveAmountTitle } from '../ReceiveAmountTitle'

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
    <Content>
      {!isAmountAccurate && '≈ '}
      <TokenAmount amount={amount} defaultValue="-" tokenSymbol={amount?.currency} />
      {fiatAmount && (
        <i>
          &nbsp;(
          <FiatAmount amount={fiatAmount} />)
        </i>
      )}
    </Content>
  )

  return (
    <ConfirmDetailsItem tooltip={tooltip} label={highlighted ? undefined : label} withTimelineDot={withTimelineDot}>
      {highlighted ? (
        <>
          <ReceiveAmountTitle>{label}</ReceiveAmountTitle>
          <span>{Amount}</span>
        </>
      ) : (
        Amount
      )}
    </ConfirmDetailsItem>
  )
}
