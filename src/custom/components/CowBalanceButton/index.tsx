import { Trans } from '@lingui/macro'
import styled, { css } from 'styled-components/macro'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useCombinedBalance } from 'state/cowToken/hooks'
import { ChainId } from 'state/lists/actions/actionsMod'
import { formatMax, formatSmartLocaleAware } from 'utils/format'
import { AMOUNT_PRECISION } from 'constants/index'
import { COW } from 'constants/tokens'

export const Wrapper = styled.div<{ isLoading: boolean }>`
  ${({ theme }) => theme.card.boxShadow};
  color: ${({ theme }) => theme.text1};
  padding: 0 12px;
  font-size: 15px;
  font-weight: 500;
  height: 38px;
  display: flex;
  align-items: center;
  position: relative;
  border-radius: 12px;
  pointer-events: auto;

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
    color: inherit;
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
}

const COW_DECIMALS = COW[ChainId.MAINNET].decimals

export default function CowBalanceButton({ onClick }: CowBalanceButtonProps) {
  const { balance, isLoading } = useCombinedBalance()

  const formattedBalance = formatSmartLocaleAware(balance, AMOUNT_PRECISION)
  const formattedMaxBalance = formatMax(balance, COW_DECIMALS)

  return (
    <Wrapper isLoading={isLoading} onClick={onClick}>
      <CowProtocolLogo />
      <b title={formattedMaxBalance && `${formattedMaxBalance} (v)COW`}>
        <Trans>{formattedBalance || 0}</Trans>
      </b>
    </Wrapper>
  )
}
