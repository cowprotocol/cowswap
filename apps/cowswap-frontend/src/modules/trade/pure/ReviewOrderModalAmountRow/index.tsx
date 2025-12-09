import { ReactElement, ReactNode } from 'react'

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
  isLast?: boolean
}

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
  isLast = false,
}: ReviewOrderAmountRowProps): ReactElement {
  const Amount = (
    <Content highlighted={highlighted}>
      {children}
      {!isAmountAccurate && '≈ '}
      <TokenAmount amount={amount} defaultValue="-" tokenSymbol={amount?.currency} />
      {amountSuffix}
      {fiatAmount && (
        <>
          &nbsp;
          <FiatAmount amount={fiatAmount} withParentheses />
        </>
      )}
    </Content>
  )

  return (
    <ConfirmDetailsItem
      tooltip={tooltip}
      label={highlighted ? undefined : label}
      withTimelineDot={withTimelineDot}
      isLast={isLast}
    >
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
