import { ReactNode } from 'react'

import { FiatAmount, InfoTooltip, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { Content, Label } from 'modules/trade/pure/ConfirmDetailsItem/styled'

import { ConfirmDetailsItem } from '../ConfirmDetailsItem'
import { ReceiveAmountTitle } from '../ReceiveAmountTitle'

export type ReviewOrderAmountRowProps = {
  amount?: Nullish<CurrencyAmount<Currency>>
  fiatAmount?: Nullish<CurrencyAmount<Currency>>
  tooltip?: ReactNode
  label: ReactNode
  children?: ReactNode
  amountSuffix?: ReactNode
  isAmountAccurate?: boolean
  withTimelineDot?: boolean
  highlighted?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function ReviewOrderModalAmountRow({
  amount,
  fiatAmount,
  tooltip,
  label,
  children,
  amountSuffix,
  isAmountAccurate = true,
  withTimelineDot = false,
  highlighted = false,
}: ReviewOrderAmountRowProps) {
  const Amount = (
    <Content highlighted={highlighted}>
      {children}
      {!isAmountAccurate && '≈ '}
      <TokenAmount amount={amount} defaultValue="-" tokenSymbol={amount?.currency} />
      {amountSuffix}
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
          <ReceiveAmountTitle>
            <Label>
              <b>
                {label} {tooltip && <InfoTooltip className="info-tooltip" content={tooltip} />}
              </b>
            </Label>
          </ReceiveAmountTitle>
          <span>{Amount}</span>
        </>
      ) : (
        Amount
      )}
    </ConfirmDetailsItem>
  )
}
