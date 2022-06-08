import styled, { createGlobalStyle } from 'styled-components/macro'
import { ButtonPrimary } from '../Button'
import FeedbackIcon from './../../assets/cow-swap/feedback.svg'
import ReactAppzi from 'react-appzi'

const FEEDBACK_ENABLED = process.env.NODE_ENV === 'production'
if (FEEDBACK_ENABLED) {
  ReactAppzi.initialize('5ju0G')
}

const GlobalStyle = createGlobalStyle<{ appziWidgetSelectorID: string }>`
  // Appzi Container override
  ${({ theme, appziWidgetSelectorID }) => theme.mediaWidth.upToMedium`
    body.appzi-f-w-open-${appziWidgetSelectorID} #appzi-wfo-${appziWidgetSelectorID} {
      left: 36px;
      bottom: 64px;
      top: initial;
      right: initial;
      position: fixed;
    }
  `}
`

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
const APPZI_KEY = 'f7591eca-72f7-4888-b15f-e7ff5fcd60cd'

declare global {
  interface Window {
    appzi?: {
      openWidget: (key: string) => void
    }
    '0': {
      appziBuild: {
        root: string
      }
    }
  }
}

const appziWidgetSelector = { id: '' }

function openWidget() {
  if (window.appzi) {
    window.appzi.openWidget(APPZI_KEY)
    console.log('Appzi widget opened')
    window[0].appziBuild && (appziWidgetSelector.id = window[0].appziBuild.root)
  } else {
    console.log('Appzi widget not opened')
  }
}

export default function Appzi() {
  if (!FEEDBACK_ENABLED) {
    return null
  }

  return (
    <>
      <GlobalStyle appziWidgetSelectorID={appziWidgetSelector.id} />
      <Wrapper onClick={openWidget}>
        <img src={FeedbackIcon} alt="Provide Feedback" />
      </Wrapper>
    </>
  )
}
