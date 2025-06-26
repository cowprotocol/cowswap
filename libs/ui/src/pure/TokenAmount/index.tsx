import { LONG_PRECISION } from '@cowprotocol/common-const'
import { formatTokenAmount, FractionUtils } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { Fraction } from '@uniswap/sdk-core'

import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { TokenNameAndSymbol, TokenSymbol } from '../TokenSymbol'

export const Wrapper = styled.span<{ lowVolumeWarning?: boolean; clickable?: boolean }>`
  background: ${({ lowVolumeWarning }) => (lowVolumeWarning ? `var(${UI.COLOR_ALERT_BG})` : '')};
  color: ${({ lowVolumeWarning }) => (lowVolumeWarning ? `var(${UI.COLOR_ALERT_TEXT})` : 'inherit')};
  border-radius: 2px;
  word-break: break-word;

  ${({ clickable }) =>
    clickable &&
    `
    cursor: pointer;
    transition:
      opacity var(${UI.ANIMATION_DURATION}) ease-in-out,
      text-decoration-color var(${UI.ANIMATION_DURATION}) ease-in-out;
    text-decoration: underline;
    text-decoration-style: dashed;
    text-decoration-thickness: 1px;
    text-underline-offset: 2px;
    text-decoration-color: var(${UI.COLOR_TEXT_OPACITY_25});

    &:hover {
      text-decoration-color: var(${UI.COLOR_TEXT_OPACITY_70});
    }
  `}
`

export const SymbolElement = styled.span<{ opacitySymbol?: boolean }>`
  color: inherit;
  opacity: ${({ opacitySymbol }) => (opacitySymbol ? 0.7 : 1)};
`

export interface TokenAmountProps {
  amount: Nullish<Fraction>
  defaultValue?: string
  tokenSymbol?: Nullish<TokenNameAndSymbol>
  className?: string
  hideTokenSymbol?: boolean
  round?: boolean
  opacitySymbol?: boolean
  clickable?: boolean
  noTitle?: boolean
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function TokenAmount({
  amount,
  defaultValue,
  className,
  tokenSymbol,
  round,
  hideTokenSymbol,
  opacitySymbol,
  clickable,
  noTitle,
}: TokenAmountProps) {
  const title = !noTitle ? getTokenAmountTitle({ amount, tokenSymbol }) : undefined

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
    <Wrapper title={title} className={className} clickable={clickable}>
      {formatTokenAmount(roundedAmount) || defaultValue}
      <SymbolElement opacitySymbol={opacitySymbol}>{tokenSymbolElement}</SymbolElement>
    </Wrapper>
  )
}

export function getTokenAmountTitle({ amount, tokenSymbol }: Pick<TokenAmountProps, 'amount' | 'tokenSymbol'>): string {
  return FractionUtils.fractionLikeToExactString(amount, LONG_PRECISION) + (tokenSymbol ? ` ${tokenSymbol.symbol}` : '')
}
