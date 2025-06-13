import { useCallback } from 'react'

import FeedbackIcon from '@cowprotocol/assets/cow-swap/feedback.svg'
import { Media } from '@cowprotocol/ui'
import { useWalletDetails, useWalletInfo } from '@cowprotocol/wallet'

import { isAppziEnabled, openFeedbackAppzi } from 'appzi'
import { transparentize } from 'color2k'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const Wrapper = styled.div`
  --size: 26px;
  border: 0;
  color: inherit;
  height: var(--size);
  width: var(--size);
  border-radius: var(--size);
  padding: 0;
  margin: 0;
  overflow: visible;
  z-index: 10;
  cursor: pointer;
  transform: translateY(0);
  transition:
    background 0.5s ease-in-out,
    transform 0.5s ease-in-out;

  > svg {
    width: 100%;
    height: 100%;
    object-fit: contain;
    color: inherit;
    fill: currentColor;
    transform: rotate(0);
    transition:
      fill 0.5s ease-in-out,
      transform 0.5s ease-in-out;
  }

  &:hover {
    background: ${({ theme }) => transparentize(theme.bg2, 0.1)};
    transform: translateY(-3px);

    ${Media.upToMedium()} {
      background: none;
      transform: none;
    }

    > svg {
      fill: ${({ theme }) => theme.white};
      transform: rotate(-360deg);

      ${Media.upToMedium()} {
        transform: none;
      }
    }
  }
`

interface AppziButtonProps {
  menuTitle?: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export default function Appzi({ menuTitle }: AppziButtonProps) {
  const { account, chainId } = useWalletInfo()
  const { walletName } = useWalletDetails()

  const showFeedbackModal = useCallback(() => {
    openFeedbackAppzi({ account, chainId, walletName })
  }, [account, chainId, walletName])

  if (!isAppziEnabled) {
    return null
  }

  return (
    <Wrapper onClick={showFeedbackModal}>
      {menuTitle && <span>{menuTitle}</span>}
      <SVG src={FeedbackIcon} description="Provide Feedback" />
    </Wrapper>
  )
}
