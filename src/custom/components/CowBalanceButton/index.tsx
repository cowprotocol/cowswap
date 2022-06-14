import { Trans } from '@lingui/macro'
import styled, { css } from 'styled-components/macro'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useCombinedBalance } from 'state/cowToken/hooks'
import { ChainId } from 'state/lists/actions/actionsMod'
import { formatMax, formatSmartLocaleAware } from 'utils/format'
import { COW } from 'constants/tokens'
import { transparentize } from 'polished'

export const Wrapper = styled.div<{ isLoading: boolean }>`
  background-color: ${({ theme }) => theme.bg4};
  color: ${({ theme }) => theme.text1};
  padding: 6px 12px;
  border: 2px solid transparent;
  font-weight: 500;
  width: auto;
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 21px;
  pointer-events: auto;
  transition: width 0.2s ease-in-out, border 0.2s ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    height: 100%;
    width: auto;
    padding: 6px 12px 6px 8px;
  `};

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 6px 8px;
  `};

  &:hover {
    border: 2px solid ${({ theme }) => transparentize(0.7, theme.text1)};
  }

  ${({ theme, isLoading }) =>
    isLoading &&
    css`
      overflow: hidden;
      &::after {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        transform: translateX(-100%);
        background-image: linear-gradient(
          90deg,
          rgba(255, 255, 255, 0) 0,
          ${theme.shimmer1} 20%,
          ${theme.shimmer2} 60%,
          rgba(255, 255, 255, 0)
        );
        animation: shimmer 2s infinite;
        content: '';
      }

      @keyframes shimmer {
        100% {
          transform: translateX(100%);
        }
      }
    `}

  > b {
    margin: 0 0 0 5px;
    font-weight: inherit;
    white-space: nowrap;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      overflow: hidden;
      max-width: 100px;
      text-overflow: ellipsis;
    `};

    ${({ theme }) => theme.mediaWidth.upToSmall`
      overflow: visible;
      max-width: initial;
    `};
  }
`

interface CowBalanceButtonProps {
  account?: string | null | undefined
  chainId: ChainId | undefined
  onClick?: () => void
  isUpToSmall?: boolean
}

const COW_DECIMALS = COW[ChainId.MAINNET].decimals

export default function CowBalanceButton({ onClick, isUpToSmall }: CowBalanceButtonProps) {
  const { balance, isLoading } = useCombinedBalance()

  const formattedBalance = formatSmartLocaleAware(balance, 0)
  const formattedMaxBalance = formatMax(balance, COW_DECIMALS)

  return (
    <Wrapper isLoading={isLoading} onClick={onClick}>
      <CowProtocolLogo />
      {!isUpToSmall && (
        <b title={formattedMaxBalance && `${formattedMaxBalance} (v)COW`}>
          <Trans>{formattedBalance || 0}</Trans>
        </b>
      )}
    </Wrapper>
  )
}
