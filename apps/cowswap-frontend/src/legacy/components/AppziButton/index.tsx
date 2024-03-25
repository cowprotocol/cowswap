import FeedbackIcon from '@cowprotocol/assets/cow-swap/feedback.svg'
import { isAppziEnabled, openFeedbackAppzi } from '@cowprotocol/common-utils'

import { transparentize } from 'color2k'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const Wrapper = styled.div`
  background: ${({ theme }) => transparentize(theme.bg2, 0.3)};
  backdrop-filter: blur(5px);
  border: 0;
  border-radius: 46px;
  font-size: 100%;
  height: 46px;
  width: 46px;
  padding: 0;
  margin: 0;
  z-index: 0;
  position: fixed;
  bottom: 46px;
  right: 21px;
  overflow: visible;
  z-index: 10;
  cursor: pointer;
  transform: translateY(0);
  transition: background 0.5s ease-in-out, transform 0.5s ease-in-out;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    left: initial;
    bottom: initial;
    position: relative;
    width: 100%;
    right: initial;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 0px;
    margin: 0px;
    font-weight: 600;
    font-size: 17px;
    padding: 15px 10px;
    color: inherit;
    border-bottom: 1px solid var(--cow-color-text-opacity-10);
    height: auto;
    background: none;
  `};

  > svg {
    width: 100%;
    height: 100%;
    padding: 8px;
    object-fit: contain;
    fill: ${({ theme }) => transparentize(theme.white, 0.2)};
    transform: rotate(0);
    transition: fill 0.5s ease-in-out, transform 0.5s ease-in-out;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      fill: ${({ theme }) => theme.white};
      background: ${({ theme }) => transparentize(theme.bg2, 0.1)};
      --size: 46px;
      height: var(--size);
      width: var(--size);
      transform: none;
      border-radius: calc(var(--size) / 3);
    `};
  }

  &:hover {
    background: ${({ theme }) => transparentize(theme.bg2, 0.1)};
    transform: translateY(-3px);

    ${({ theme }) => theme.mediaWidth.upToMedium`
      background: none;
      transform: none;
    `};

    > svg {
      fill: ${({ theme }) => theme.white};
      transform: rotate(-360deg);

      ${({ theme }) => theme.mediaWidth.upToMedium`
        transform: none;
    `};
    }
  }
`

interface AppziButtonProps {
  menuTitle?: string
  onClick?: () => void
  isUpToMedium?: boolean
}

export default function Appzi({ menuTitle, onClick, isUpToMedium }: AppziButtonProps) {
  if (!isAppziEnabled) {
    return null
  }

  return (
    // <Wrapper onClick={openFeedbackAppzi}>
    <Wrapper onClick={isUpToMedium ? onClick && openFeedbackAppzi : openFeedbackAppzi}>
      {menuTitle && <span>{menuTitle}</span>}
      <SVG src={FeedbackIcon} description="Provide Feedback" />
    </Wrapper>
  )
}
