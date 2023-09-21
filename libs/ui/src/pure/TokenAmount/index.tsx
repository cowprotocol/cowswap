import { LONG_PRECISION } from '@cowprotocol/common-const'
import { formatTokenAmount, FractionUtils } from '@cowprotocol/common-utils'
import { FeatureFlag } from '@cowprotocol/common-utils'

import { darken, transparentize } from 'polished'
import styled from 'styled-components'
import { FractionLike, Nullish } from '../../types'
import { TokenSymbol, TokenSymbolProps } from '../TokenSymbol'
import { AMOUNTS_FORMATTING_FEATURE_FLAG } from '../../consts'

export const Wrapper = styled.span<{ highlight: boolean; lowVolumeWarning?: boolean }>`
  background: ${({ highlight }) => (highlight ? 'rgba(196,18,255,0.4)' : '')};
  color: ${({ lowVolumeWarning, theme }) =>
    lowVolumeWarning ? darken(theme.darkMode ? 0 : 0.15, theme.alert) : 'inherit'};
  word-break: break-word;
`

export const SymbolElement = styled.span<{ opacitySymbol?: boolean }>`
  ${({ opacitySymbol, theme }) => (opacitySymbol ? `color: ${transparentize(0.3, theme.text1)}` : '')};
`

export interface TokenAmountProps {
  amount: Nullish<FractionLike>
  defaultValue?: string
  tokenSymbol?: Nullish<TokenSymbolProps['token']>
  className?: string
  hideTokenSymbol?: boolean
  round?: boolean
  opacitySymbol?: boolean
}

const highlight = !!FeatureFlag.get(AMOUNTS_FORMATTING_FEATURE_FLAG)

export function TokenAmount({
  amount,
  defaultValue,
  className,
  tokenSymbol,
  round,
  hideTokenSymbol,
  opacitySymbol,
}: TokenAmountProps) {
  const title =
    FractionUtils.fractionLikeToExactString(amount, LONG_PRECISION) + (tokenSymbol ? ` ${tokenSymbol.symbol}` : '')

  if (!amount) return null

  const tokenSymbolElement =
    hideTokenSymbol || !tokenSymbol ? null : (
      <>
        {' '}
        <TokenSymbol token={tokenSymbol} />
      </>
    )

  const roundedAmount = round ? FractionUtils.round(amount) : amount
  return (
    <Wrapper title={title} className={className} highlight={highlight}>
      {formatTokenAmount(roundedAmount) || defaultValue}
      <SymbolElement opacitySymbol={opacitySymbol}>{tokenSymbolElement}</SymbolElement>
    </Wrapper>
  )
}
