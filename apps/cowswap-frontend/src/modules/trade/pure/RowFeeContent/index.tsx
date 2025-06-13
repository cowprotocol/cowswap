import { ReactNode } from 'react'

import { FiatAmount, getTokenAmountTitle, InfoTooltip, RowBetween, RowFixed, TokenAmount, UI } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { FiatRate } from 'common/pure/RateInfo'

const PlusGas = styled.span`
  color: var(${UI.COLOR_TEXT2});
  font-size: 11px;
  font-weight: 400;
`

const Label = styled.span`
  font-weight: 400;
  margin-right: 5px;
  opacity: 0.7;
`

const FreeLabel = styled.span`
  color: var(${UI.COLOR_GREEN});
`

export interface RowFeeContentProps {
  label: string
  tooltip: ReactNode
  feeAmount?: CurrencyAmount<Currency> | null
  feeInFiat: CurrencyAmount<Token> | null
  feeIsApproximate?: boolean
  noLabel?: boolean
  requireGas?: boolean
  marginBottom?: number
  isFree: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function RowFeeContent(props: RowFeeContentProps) {
  const {
    label,
    tooltip,
    feeAmount,
    feeInFiat,
    isFree,
    feeIsApproximate,
    noLabel,
    requireGas,
    marginBottom = 5,
  } = props

  const tokenSymbol = feeAmount?.currency

  return (
    <RowBetween marginBottom={marginBottom ? `${marginBottom}px` : undefined}>
      {!noLabel && (
        <RowFixed>
          <Label>{label}</Label>
          <InfoTooltip content={tooltip} />
        </RowFixed>
      )}

      <div title={getTokenAmountTitle({ amount: feeAmount, tokenSymbol })}>
        {isFree ? (
          <FreeLabel>FREE</FreeLabel>
        ) : (
          <>
            {feeIsApproximate ? '≈ ' : ''}
            <TokenAmount amount={feeAmount} tokenSymbol={tokenSymbol} />
            {requireGas && <PlusGas>&nbsp;+ gas</PlusGas>}
          </>
        )}{' '}
        {!isFree && feeInFiat && (
          <FiatRate>
            (<FiatAmount amount={feeInFiat} />)
          </FiatRate>
        )}
      </div>
    </RowBetween>
  )
}
