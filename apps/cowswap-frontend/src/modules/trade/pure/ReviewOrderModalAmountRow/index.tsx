import { ReactNode } from 'react'

import { FiatAmount, InfoTooltip, Row, TokenAmount } from '@cowprotocol/ui'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { Content } from 'modules/trade/pure/ConfirmDetailsItem/styled'

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
  alwaysRow?: boolean
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
  alwaysRow = false,
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
    <ConfirmDetailsItem
      tooltip={tooltip}
      label={highlighted ? undefined : label}
      alwaysRow={alwaysRow}
      withTimelineDot={withTimelineDot}
    >
      {highlighted ? (
        <>
          <ReceiveAmountTitle>
            <Row gap="6px">
              <span>{label}</span>
              {tooltip && <InfoTooltip content={tooltip} />}
            </Row>
          </ReceiveAmountTitle>
          <span>{Amount}</span>
        </>
      ) : (
        Amount
      )}
    </ConfirmDetailsItem>
  )
}
