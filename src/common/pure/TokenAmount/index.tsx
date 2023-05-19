import { formatTokenAmount } from 'utils/amountFormat'
import { FractionLike, Nullish } from 'types'
import { TokenSymbol, TokenSymbolProps } from 'common/pure/TokenSymbol'
import { FractionUtils } from 'utils/fractionUtils'
import { LONG_PRECISION } from 'constants/index'
import { FeatureFlag } from 'utils/featureFlags'
import styled from 'styled-components/macro'
import { AMOUNTS_FORMATTING_FEATURE_FLAG } from 'constants/featureFlags'
import { darken, transparentize } from 'polished'

export const Wrapper = styled.span<{ highlight: boolean; lowVolumeWarning?: boolean }>`
  background: ${({ highlight }) => (highlight ? 'rgba(196,18,255,0.4)' : '')};
  color: ${({ lowVolumeWarning, theme }) =>
    lowVolumeWarning ? darken(theme.darkMode ? 0 : 0.15, theme.alert) : 'inherit'};
  word-break: word-break;
`

export const SymbolElement = styled.span<{ opacitySymbol?: boolean }>`
  ${({ opacitySymbol, theme }) => (opacitySymbol ? `color: ${transparentize(0.3, theme.text1)}` : '')};
`

export interface TokenAmountProps {
  amount: Nullish<FractionLike>
  defaultValue?: string
  tokenSymbol?: TokenSymbolProps['token']
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

  return (
    <Wrapper title={title} className={className} highlight={highlight}>
      {formatTokenAmount(round ? FractionUtils.round(amount) : amount) || defaultValue}
      <SymbolElement opacitySymbol={opacitySymbol}>{tokenSymbolElement}</SymbolElement>
    </Wrapper>
  )
}
