import { formatTokenAmount } from '@cow/utils/amountFormat'
import { FractionLike, Nullish } from '@cow/types'
import { TokenSymbol, TokenSymbolProps } from '@cow/common/pure/TokenSymbol'
import { FractionUtils } from '@cow/utils/fractionUtils'
import { LONG_PRECISION } from 'constants/index'
import { FeatureFlag } from '@cow/utils/featureFlags'
import styled from 'styled-components/macro'
import { AMOUNTS_FORMATTING_FEATURE_FLAG } from '@cow/constants/featureFlags'
import { darken, transparentize } from 'polished'
// import { LowVolumeWarningContent } from '@cow/modules/limitOrders/pure/Orders/OrderRow'

export const Wrapper = styled.span<{ highlight: boolean; lowVolumeWarning?: boolean }>`
  background: ${({ highlight }) => (highlight ? 'rgba(196,18,255,0.4)' : '')};
  color: ${({ lowVolumeWarning, theme }) =>
    lowVolumeWarning ? darken(theme.darkMode ? 0 : 0.15, theme.alert) : 'inherit'};
`

const SymbolElement = styled.span<{ opacitySymbol?: boolean }>`
  color: ${({ opacitySymbol, theme }) => transparentize(opacitySymbol ? 0.3 : 0, theme.text1)};
`

export interface TokenAmountProps {
  amount: Nullish<FractionLike>
  defaultValue?: string
  tokenSymbol?: TokenSymbolProps['token']
  className?: string
  hideTokenSymbol?: boolean
  round?: boolean
  lowVolumeWarning?: boolean
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
  lowVolumeWarning,
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
    <Wrapper title={title} className={className} highlight={highlight} lowVolumeWarning={lowVolumeWarning}>
      {formatTokenAmount(round ? FractionUtils.round(amount) : amount) || defaultValue}
      <SymbolElement opacitySymbol={opacitySymbol}>{tokenSymbolElement}</SymbolElement>

      {/* {lowVolumeWarning && LowVolumeWarningContent()} */}
    </Wrapper>
  )
}
