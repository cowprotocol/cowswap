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
    background: ${({ theme }) => transparentize(theme.bg2, 0.1)};
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
    `};
  }

  &:hover {
    background: ${({ theme }) => transparentize(theme.bg2, 0.1)};
    transform: translateY(-3px);

    > svg {
      fill: ${({ theme }) => theme.white};
      transform: rotate(-360deg);
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    left: 14px;
    height: 38px;
    width: 38px;
    bottom: 11px;
    right: initial;
    z-index: 10;
    box-shadow: none;
    border-width: 3px;
  `};
`

export default function Appzi() {
  if (!isAppziEnabled) {
    return null
  }

  return (
    <Wrapper onClick={openFeedbackAppzi}>
      <SVG src={FeedbackIcon} description="Provide Feedback" />
    </Wrapper>
  )
}
