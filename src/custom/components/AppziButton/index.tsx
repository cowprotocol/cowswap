import styled from 'styled-components/macro'
import FeedbackIcon from './../../assets/cow-swap/feedback.svg'
import { isAppziEnabled, openFeedbackAppzi } from 'utils/appzi'
import SVG from 'react-inlinesvg'
import { transparentize } from 'polished'

const Wrapper = styled.div`
  background: ${({ theme }) => transparentize(0.6, theme.white)};
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
  right: 16px;
  overflow: visible;
  z-index: 2;
  cursor: pointer;
  transform: translateY(0);
  transition: transform 0.3s ease-in-out, background 0.3s ease-in-out;

  > svg {
    width: 100%;
    height: 100%;
    padding: 8px;
    object-fit: contain;
    fill: ${({ theme }) => transparentize(0.1, theme.text1)};
    transition: fill 0.3s ease-in-out;
  }

  &:hover {
    background: ${({ theme }) => theme.white};
    transform: translateY(-3px);

    > svg {
      fill: ${({ theme }) => theme.text1};
    }
  }

  ${({ theme }) => theme.mediaWidth.upToMedium`
    left: 14px;
    height: 42px;
    width: 42px;
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
