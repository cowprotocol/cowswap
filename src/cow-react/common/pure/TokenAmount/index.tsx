import { formatTokenAmount } from '@cow/utils/amountFormat'
import { FractionLike, Nullish } from '@cow/types'
import { TokenSymbol, TokenSymbolProps } from '@cow/common/pure/TokenSymbol'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { LONG_PRECISION } from 'constants/index'
import { FeatureFlag } from '@cow/utils/featureFlags'
import styled from 'styled-components/macro'
import { AMOUNTS_FORMATTING_FEATURE_FLAG } from '@cow/constants/featureFlags'

export interface TokenAmountProps {
  amount: Nullish<FractionLike>
  defaultValue?: string
  tokenSymbol?: TokenSymbolProps['token']
  className?: string
  hideTokenSymbol?: boolean
  round?: boolean
}

const highlight = !!FeatureFlag.get(AMOUNTS_FORMATTING_FEATURE_FLAG)

const Wrapper = styled.span<{ highlight: boolean }>`
  background: ${({ highlight }) => (highlight ? 'rgba(196,18,255,0.4)' : '')};
`

export function TokenAmount({
  amount,
  defaultValue,
  className,
  tokenSymbol,
  round,
  hideTokenSymbol,
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
    <>
      <Wrapper title={title} className={className} highlight={highlight}>
        {formatTokenAmount(round ? FractionUtils.round(amount) : amount) || defaultValue}
        {tokenSymbolElement}
      </Wrapper>
    </>
  )
}
