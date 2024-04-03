import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Command } from '@cowprotocol/types'
import { UI } from '@cowprotocol/ui'
import { TokenAmount } from '@cowprotocol/ui'

import { transparentize } from 'color2k'
import styled, { css } from 'styled-components/macro'

import CowProtocolLogo from 'legacy/components/CowProtocolLogo'

import { useCombinedBalance } from '../../hooks/useCombinedBalance'

export const Wrapper = styled.div<{ isLoading: boolean }>`
  background-color: transparent;
  color: inherit;
  padding: 6px 12px;
  border: 2px solid transparent;
  font-weight: 500;
  width: auto;
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 21px;
  pointer-events: auto;
  transition: width var(${UI.ANIMATION_DURATION}) ease-in-out, border var(${UI.ANIMATION_DURATION}) ease-in-out;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ theme }) => theme.mediaWidth.upToLarge`
    position: absolute;
    z-index: 1001;
    right: 66px;
    background: var(${UI.COLOR_PAPER_DARKER});
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    right: 56px;
  `};

  ${({ theme }) => theme.mediaWidth.upToTiny`
    position: relative;
    right: initial;
    margin: 0 auto 0 0;
    height: 36px;
    padding: 6px;
  `};

  &:hover {
    border: 2px solid ${({ theme }) => transparentize(theme.text, 0.7)};
  }

  ${({ theme, isLoading }) =>
    isLoading &&
    css`
      overflow: hidden;
      &::before {
        z-index: -1;
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        ${theme.shimmer}; // shimmer effect
        content: '';
      }
    `}

  > b {
    margin: 0 0 0 5px;
    font-weight: inherit;
    white-space: nowrap;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      overflow: hidden;
      text-overflow: ellipsis;
    `};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      max-width: 120px;
    `};
  }
`
interface CowBalanceButtonProps {
  account?: string | null | undefined
  chainId: ChainId | undefined
  onClick?: Command
}

export default function CowBalanceButton({ onClick }: CowBalanceButtonProps) {
  const { balance, isLoading } = useCombinedBalance()

  return (
    <Wrapper isLoading={isLoading} onClick={onClick}>
      <CowProtocolLogo />

      <b>
        <TokenAmount
          round={true}
          hideTokenSymbol={true}
          amount={balance}
          defaultValue="0"
          tokenSymbol={{ symbol: '(v)COW' }}
        />
      </b>
    </Wrapper>
  )
}
