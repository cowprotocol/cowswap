import { ReactNode } from 'react'

import { FiatAmount, getTokenAmountTitle, RowFixed, TokenAmount, UI } from '@cowprotocol/ui'
import { HoverTooltip } from '@cowprotocol/ui'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { StyledRowBetween, TextWrapper } from 'modules/swap/pure/Row/styled'
import { RowStyleProps } from 'modules/swap/pure/Row/types'
import { StyledInfoIcon } from 'modules/swap/pure/styled'

import { FiatRate } from 'common/pure/RateInfo'

const PlusGas = styled.span`
  color: var(${UI.COLOR_TEXT2});
  font-size: 11px;
  font-weight: 400;
`

export interface RowFeeContentProps {
  label: string
  tooltip: ReactNode
  feeAmount?: CurrencyAmount<Currency>
  feeInFiat: CurrencyAmount<Token> | null
  styleProps?: RowStyleProps
  noLabel?: boolean
  requireGas?: boolean
  isFree: boolean
}

export function RowFeeContent(props: RowFeeContentProps) {
  const { label, tooltip, feeAmount, feeInFiat, isFree, noLabel, requireGas, styleProps = {} } = props

  const tokenSymbol = feeAmount?.currency

  return (
    <StyledRowBetween {...styleProps}>
      {!noLabel && (
        <RowFixed>
          <TextWrapper>{label}</TextWrapper>
          <HoverTooltip content={tooltip} wrapInContainer>
            <StyledInfoIcon size={16} />
          </HoverTooltip>
        </RowFixed>
      )}

      <TextWrapper title={getTokenAmountTitle({ amount: feeAmount, tokenSymbol })} success={isFree}>
        {isFree ? (
          'FREE'
        ) : (
          <>
            <TokenAmount amount={feeAmount} tokenSymbol={tokenSymbol} />
            {requireGas && <PlusGas>&nbsp;+ gas</PlusGas>}
          </>
        )}{' '}
        {feeInFiat && (
          <FiatRate>
            <FiatAmount amount={feeInFiat} />
          </FiatRate>
        )}
      </TextWrapper>
    </StyledRowBetween>
  )
}
