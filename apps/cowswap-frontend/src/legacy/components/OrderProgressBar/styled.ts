import CowProtocolLogo from '@cowprotocol/assets/cow-swap/cowprotocol.svg'
import { ExternalLink } from '@cowprotocol/ui'
import { UI } from '@cowprotocol/ui'

import { animated } from '@react-spring/web'
import { CheckCircle, Clock } from 'react-feather'
import styled from 'styled-components/macro'

export const ProgressBarWrapper = animated(styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 100%;
  margin: 16px 0 0;
  overflow: hidden;
  display: flex;
  flex-flow: column wrap;
  border-radius: 12px;
  padding: 20px;
  color: inherit;
  background-color: var(${UI.COLOR_PAPER_DARKER});
  transition: height 0.2s ease;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    padding: 18px;
    margin: 24px auto 12px;
    width: 100%;
    max-width: 100%;
    grid-column: 1 / -1;
  `};
`)

export const ProgressBarInnerWrapper = styled.div`
  background-color: var(${UI.COLOR_PAPER_DARKEST});
  border-radius: 18px;
  overflow: visible !important;
  position: relative;
`

export const ProgressBarIndicator = styled.div.attrs<{ percentage: number }>((props) => ({
  style: {
    width: props.percentage + '%',
  },
}))<{ percentage: number }>`
  height: 18px;
  background: rgb(233, 214, 37);
  transform: translateX(0%);
  border-radius: 12px;
  transition: all 0.5s;
  position: relative;
  padding-left: 24px;
`

export const CowProtocolIcon = styled.div`
  position: absolute;
  top: -4px;
  right: 0;
  height: 24px;
  width: 24px;
  border-radius: 100%;
  border: 1px solid ${({ theme }) => theme.bg1};
  background: url(${CowProtocolLogo}) ${({ theme }) => theme.black} no-repeat center/75%;
  box-shadow: 0 0 10px 2px ${({ theme }) => theme.bg1};
`

export const WarningLogo = styled.div`
  position: absolute;
  top: -4px;
  right: 0;
  height: 26px;
  width: 26px;
  border-radius: 9px;
  border: transparent;

  background: ${({ theme }) => theme.blueShade};
  box-shadow: 0 0 10px 2px ${({ theme }) => theme.bg1};

  img {
    margin: 4px 0 0 2px;
    width: 22px;
  }

  &::after {
    filter: blur(10px);
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: -2px;
    top: -2px;
    background: ${({ theme }) => `linear-gradient(45deg, #e57751, #c5daef, #275194, ${theme.bg1}, #c5daef, #1b5a7a)`};
    background-size: 800%;
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    z-index: -1;
    animation: steam 7s linear infinite;
    border-radius: 9px;
  }

  @keyframes steam {
    0% {
      background-position: 0 0;
    }
    50% {
      background-position: 400% 0;
    }
    100% {
      background-position: 0 0;
    }
  }
`

export const SuccessProgress = styled(ProgressBarIndicator)`
  background: linear-gradient(270deg, #27ae5f 15%, #b6a82d 125%);
`

export const DelayedProgress = styled(ProgressBarIndicator)`
  background: linear-gradient(270deg, #27ae5f 25%, #ff784a 100%);
`

export const GreenClockIcon = styled(Clock)`
  --size: 28px;
  width: var(--size);
  height: var(--size);
  object-fit: contain;
  color: var(${UI.COLOR_SUCCESS});
`

export const GreenCheckIcon = styled(CheckCircle)`
  --size: 28px;
  width: var(--size);
  height: var(--size);
  object-fit: contain;
  color: var(${UI.COLOR_SUCCESS});
`

export const OrangeClockIcon = styled(Clock)`
  --size: 28px;
  width: var(--size);
  height: var(--size);
  object-fit: contain;
  color: var(${UI.COLOR_ALERT_TEXT_DARKER});
`

export const StatusMsgContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 20px auto 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 0.2rem;
    display: flex;
    align-items: center;
    flex-direction: column;

    svg {
      flex-shrink: 0;
    }
  `};
`

export const StatusGraph = styled.div`
  display: flex;
  align-items: center;
  margin: 42px auto 0;
  gap: 10px;
  border: 1px solid var(${UI.COLOR_PAPER_DARKEST});
  border-radius: 16px;
  padding: 16px;
  min-height: 100px;
  width: 100%;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    align-items: center;
    flex-direction: column;
  `};

  > img {
    margin: 0 10px 0 0;
  }

  p {
    font-size: 15px;
    padding: 0;
    margin: 0;
  }
`

export const StatusWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
`

export const StatusMsg = styled.p`
  font-size: 0.85rem;
  color: inherit;
  margin: 0;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    font-size: 0.835rem;
  `};

  > button {
    color: inherit;
    padding: 0;
  }
`

export const StyledCoWLink = styled(ExternalLink)`
  color: inherit;
  text-decoration: underline;
  opacity: 1 !important;

  span {
    color: ${({ theme }) => theme.text3};
  }

  :hover {
    opacity: 0.8 !important;
  }
`

export const StyledExternalLink = styled(ExternalLink)`
  font-size: inherit;
  color: inherit;
`
