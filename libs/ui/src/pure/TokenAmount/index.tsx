import { LONG_PRECISION } from '@cowprotocol/common-const'
import { formatTokenAmount, FractionUtils } from '@cowprotocol/common-utils'

import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { FractionLike, Nullish } from '../../types'
import { TokenNameAndSymbol, TokenSymbol } from '../TokenSymbol'

export const Wrapper = styled.span<{ lowVolumeWarning?: boolean }>`
  background: ${({ lowVolumeWarning }) => (lowVolumeWarning ? `var(${UI.COLOR_ALERT_BG})` : '')};
  color: ${({ lowVolumeWarning }) => (lowVolumeWarning ? `var(${UI.COLOR_ALERT_TEXT})` : 'inherit')};
  border-radius: 2px;
  word-break: break-word;
`

export const SymbolElement = styled.span<{ opacitySymbol?: boolean }>`
  color: inherit;
  opacity: ${({ opacitySymbol }) => (opacitySymbol ? 0.7 : 1)};
`

export interface TokenAmountProps {
  amount: Nullish<FractionLike>
  defaultValue?: string
  tokenSymbol?: Nullish<TokenNameAndSymbol>
  className?: string
  hideTokenSymbol?: boolean
  round?: boolean
  opacitySymbol?: boolean
}

export function TokenAmount({
  amount,
  defaultValue,
  className,
  tokenSymbol,
  round,
  hideTokenSymbol,
  opacitySymbol,
}: TokenAmountProps) {
  const title = getTokenAmountTitle({ amount, tokenSymbol })

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
    <Wrapper title={title} className={className}>
      {formatTokenAmount(roundedAmount) || defaultValue}
      <SymbolElement opacitySymbol={opacitySymbol}>{tokenSymbolElement}</SymbolElement>
    </Wrapper>
  )
}

export function getTokenAmountTitle({ amount, tokenSymbol }: Pick<TokenAmountProps, 'amount' | 'tokenSymbol'>): string {
  return FractionUtils.fractionLikeToExactString(amount, LONG_PRECISION) + (tokenSymbol ? ` ${tokenSymbol.symbol}` : '')
}
