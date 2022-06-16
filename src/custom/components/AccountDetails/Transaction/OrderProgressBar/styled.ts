import styled from 'styled-components/macro'
import { animated } from 'react-spring'
import { CheckCircle, Clock } from 'react-feather'
import CowProtocolLogo from 'assets/cow-swap/cowprotocol.svg'

export const ProgressBarWrapper = animated(styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  width: 575px;
  /* min-height: 164px; */
  margin: 16px 0 8px 0;
  overflow: hidden;
  display: flex;
  flex-flow: column wrap;
  border-radius: 12px;
  padding: 20px 20px 0;
  color: ${({ theme }) => theme.text1};
  background-color: ${({ theme }) => theme.bg4};
  transition: height 0.2s ease;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    margin: 24px auto 12px;
    width: 100%;
    max-width: 100%;
    grid-column: 1 / -1;
  `};
`)

export const ProgressBarInnerWrapper = styled.div`
  background-color: ${({ theme }) => theme.blue4};
  border-radius: 18px;
  overflow: visible !important;
  position: relative;
`

export const ProgressBarIndicator = styled.div<{ percentage: number }>`
  height: 18px;
  background: rgb(233, 214, 37);
  transform: translateX(0%);
  border-radius: 12px;
  transition: all 0.5s;
  width: ${({ percentage }) => percentage}%;
`

export const CowProtocolIcon = styled.div`
  position: absolute;
  top: -4px;
  right: 0px;
  height: 24px;
  width: 24px;
  border-radius: 100%;
  border: 1px solid ${({ theme }) => theme.bg4};
  background: url(${CowProtocolLogo}) ${({ theme }) => theme.black} no-repeat center/75%;
  box-shadow: 0px 0px 10px 2px ${({ theme }) => theme.bg1};
`

export const WarningLogo = styled.div`
  position: absolute;
  top: -4px;
  right: 0px;
  height: 26px;
  width: 26px;
  border-radius: 9px;
  border: transparent;

  background: ${({ theme }) => theme.blueShade};
  box-shadow: 0px 0px 10px 2px ${({ theme }) => theme.bg1};

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
    background: ${({ theme }) => `linear-gradient(45deg, #e57751, #c5daef, #275194, ${theme.bg4}, #c5daef, #1b5a7a)`};
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
  margin: 0 0.5rem 0 0;
  color: ${({ theme }) => theme.success};
`

export const GreenCheckIcon = styled(CheckCircle)`
  margin: 0 0.5rem 0 0;
  color: ${({ theme }) => theme.success};
`

export const OrangeClockIcon = styled(Clock)`
  margin: 0 0.5rem 0 0;
  color: ${({ theme }) => theme.yellow1};
`

export const StatusMsgContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin: 1rem 0;

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
  margin: 1rem 0 0 0;
  gap: 1rem;
  border: 1px solid ${({ theme }) => theme.border2};
  border-radius: 0.6rem;
  padding: 0 0.9rem;
  min-height: 6rem;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    gap: 0rem;
    display: flex;
    align-items: center;
    flex-direction: column;
    padding: 0.4rem 0.8rem; 
  `};
`

export const StatusWrapper = styled.div`
  display: flex;
  flex-direction: row;
`

export const StatusMsg = styled.p`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.text1};
  margin: 0;

  span {
    color: ${({ theme }) => theme.orange};
  }
`
