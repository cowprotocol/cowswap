import styled from 'styled-components/macro'
import { ButtonPrimary } from '../Button'
import FeedbackIcon from './../../assets/cow-swap/feedback.svg'
import { isAppziEnabled, openFeedbackAppzi } from 'utils/appZi'

const Wrapper = styled(ButtonPrimary)`
  border-radius: 46px;
  font-size: 100%;
  height: 46px;
  width: 46px;
  padding: 0;
  margin: 0;
  z-index: 0;
  position: fixed;
  bottom: 60px;
  right: 16px;
  overflow: visible;
  z-index: 2;

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

  &::after {
    content: 'Give feedback!';
    display: block;
    position: absolute;
    top: 0;
    color: ${({ theme }) => theme.black};
    background: ${({ theme }) => theme.primary1};
    padding: 9px;
    font-size: 12px;
    border-radius: 14px;
    visibility: hidden;
    opacity: 0;
    transition: opacity 0.2s ease-in-out, visibility 0.2s ease-in-out, top 0.2s ease-in-out;

    ${({ theme }) => theme.mediaWidth.upToMedium`
      display: none;
    `}

  &:hover::after {
    top: -60px;
    visibility: visible;
    opacity: 1;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      display: none;
    `};
  }

  > img {
    width: 100%;
    height: 100%;
    padding: 8px;
    object-fit: contain;
  }
`

export default function Appzi() {
  if (!isAppziEnabled) {
    return null
  }

  return (
    <Wrapper onClick={openFeedbackAppzi}>
      <img src={FeedbackIcon} alt="Provide Feedback" />
    </Wrapper>
  )
}
