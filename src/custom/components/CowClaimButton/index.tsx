import { Trans } from '@lingui/macro'
import { Dots } from 'components/swap/styleds'
import styled, { css } from 'styled-components/macro'
import CowProtocolLogo from 'components/CowProtocolLogo'
import { useUserHasSubmittedClaim } from 'state/transactions/hooks'

export const Wrapper = styled.div<{ isClaimPage?: boolean | null }>`
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

  > b {
    margin: 0 0 0 5px;
    color: inherit;
    font-weight: inherit;
    white-space: nowrap;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: -1px;
    top: -1px;
    background: ${({ theme }) =>
      `linear-gradient(45deg, ${theme.primary1}, ${theme.primary2}, ${theme.primary3}, ${theme.bg4}, ${theme.primary1}, ${theme.primary2})`};
    background-size: 800%;
    width: calc(100% + 2px);
    height: calc(100% + 2px);
    z-index: -1;
    animation: glow 50s linear infinite;
    transition: background-position 0.3s ease-in-out;
    border-radius: 12px;
  }

  &::after {
    filter: blur(8px);
  }

  &:hover::before,
  &:hover::after {
    animation: glow 12s linear infinite;
  }

  // Stop glowing effect on claim page
  ${({ isClaimPage }) =>
    isClaimPage &&
    css`
      &::before,
      &::after {
        content: none;
      }
    `};

  @keyframes glow {
    0% {
      background-position: 0 0;
    }
    50% {
      background-position: 300% 0;
    }
    100% {
      background-position: 0 0;
    }
  }
`

interface CowClaimButtonProps {
  isClaimPage?: boolean | null | undefined
  account?: string | null | undefined
  handleOnClickClaim?: () => void
}

export default function CowClaimButton({ isClaimPage, account, handleOnClickClaim }: CowClaimButtonProps) {
  const { claimTxn } = useUserHasSubmittedClaim(account ?? undefined)

  return (
    <Wrapper isClaimPage={isClaimPage} onClick={handleOnClickClaim}>
      {claimTxn && !claimTxn?.receipt ? (
        <Dots>
          <Trans>Claiming vCOW...</Trans>
        </Dots>
      ) : (
        <>
          <CowProtocolLogo />
          <b>
            <Trans>Claim vCOW</Trans>
          </b>
        </>
      )}
    </Wrapper>
  )
}
