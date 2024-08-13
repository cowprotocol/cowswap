import IMAGE_STAR_SHINE from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { LinkStyledButton, Media, UI } from '@cowprotocol/ui'

import styled, { css, keyframes } from 'styled-components/macro'

import { CancelButton as CancelButtonOriginal } from '../CancelButton'

const SUCCESS_COLOR = '#04795b' // TODO: Fix hardcoded color

export const Icon = styled.div<{ status: string; customColor?: string }>`
  --width: 28px;
  width: var(--width);
  height: auto;
  min-width: var(--width);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  color: ${(props) => props.customColor || `var(${UI.COLOR_PRIMARY_LIGHTER})`};
  font-weight: bold;
  font-size: 24px;

  > svg {
    color: ${(props) => {
      if (props.status === 'done') return '#4CAF50'
      if (props.status === 'active') return '#2196F3'
      if (props.status === 'error') return '#F44336'
      return 'currentColor'
    }};
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

export const slideUp = keyframes`
  from {
    transform: translateY(10px);
  }
  to {
    transform: translateY(0);
  }
`

export const slideDown = keyframes`
  from {
    transform: translateY(-10px);
  }
  to {
    transform: translateY(0);
  }
`

export const ProgressContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
`

export const StepsWrapper = styled.div`
  overflow: hidden;
  display: flex;
  flex-flow: column wrap;
  padding: 30px 30px 0;
  gap: 28px;
  width: 100%;
  margin: 0 auto;

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

export const Step = styled.div<{ status: string; isFirst: boolean }>`
  display: flex;
  align-items: flex-start;
  margin: 0;
  opacity: ${(props) => {
    if (props.status === 'done') return 0.1
    if (props.status === 'active') return 1
    if (props.status === 'next') return 0.4
    if (props.status === 'future' || props.status === 'disabled') return 0.3
    return 1
  }};
  transform: translateY(
    ${(props) => {
      if (props.status === 'done') return '-10px'
      if (props.status === 'active' && props.isFirst) return '10px'
      return '0'
    }}
  );
  transition: all 0.3s ease;
  animation: ${(props) => {
      if (props.status === 'done') return slideUp
      if (props.status === 'active') return slideDown
      return 'none'
    }}
    0.3s ease;
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
`

export const Title = styled.h3<{ customColor?: string }>`
  color: ${({ customColor }) => customColor || `var(${UI.COLOR_TEXT_PAPER})`};
  margin: 0;
  font-size: 21px;
`

export const Description = styled.p<{ center?: boolean; margin?: string }>`
  margin: ${({ margin }) => margin || '8px 0 0'};
  font-size: 14px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-align: ${({ center }) => (center ? 'center' : 'left')};
`

export const Link = styled.a<{ underline?: boolean }>`
  color: var(${UI.COLOR_TEXT_PAPER});
  text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  font-size: 14px;
  margin: 8px 0 0;
  display: inline;

  &:hover {
    text-decoration: underline;
  }
`

export const CancelButton = styled(CancelButtonOriginal)`
  font-size: 14px;
  padding: 1px 0;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export const Button = styled(LinkStyledButton)`
  font-size: 14px;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`

export const ProgressImageWrapper = styled.div<{ bgColor?: string; padding?: string }>`
  width: 100%;
  height: 246px;
  max-height: 246px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
  border-radius: 21px;
  overflow: hidden;
  padding: ${({ padding }) => padding || '0'};
  background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKER})`};
  position: relative;

  > img,
  > svg {
    --size: 100%;
    max-width: var(--size);
    max-height: var(--size);
    height: var(--size);
    width: var(--size);
    object-fit: contain;
    padding: 0;
    margin: 0;
  }
`

export const DebugPanel = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
`

export const LoadingEllipsis = styled.span`
  &::after {
    content: '...';
    animation: ellipsis 1s infinite;
  }

  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

export const ProgressTopSection = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  border-radius: 21px;
  background: var(${UI.COLOR_PAPER_DARKER});
`

export const OriginalOrderIntent = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  padding: 10px;
  width: 100%;
  text-align: center;
  gap: 5px;
`

export const OrderTokenImage = styled.img`
  --size: 20px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  background: var(${UI.COLOR_PAPER_DARKEST});
`

export const AnimatedTokensWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 136px;
  position: relative;
  overflow: hidden;
`

export const TokenWrapper = styled.div<{ position: 'left' | 'center' | 'right' }>`
  --size: 136px;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 0;
  margin: auto;
  left: 0;
  animation: ${({ position }) => (position === 'left' ? 'appear-left' : position === 'right' ? 'appear-right' : 'none')}
    2.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  animation-delay: ${({ position }) => (position === 'center' ? '0s' : '0.75s')};
  border: ${({ position }) => (position === 'right' ? '8px solid #65D9FF' : '0')}; // TODO: Fix hardcoded colors
  border: 8px solid #65d9ff;
  box-sizing: content-box;
  background: ${({ position }) => (position === 'right' ? `var(${UI.COLOR_PRIMARY})` : 'transparent')};

  ${({ position }) =>
    position === 'right' &&
    `&::after {
    --size: 36px;
    content: '';
    position: absolute;
    right: 0;
    top: 0;
    width: var(--size);
    height: var(--size);
    background: url(${IMAGE_STAR_SHINE}) no-repeat;
    background-size: 100% 100%;
    animation: star-shine 1s infinite;
  }`}
  > span {
    padding: ${({ position }) => (position === 'right' ? '45px 40px 34px;' : '0')};
  }

  @keyframes appear-left {
    to {
      transform: translateX(-68px);
    }
  }

  @keyframes appear-right {
    to {
      transform: translateX(68px);
    }
  }
`

const progressAnimation = (duration: number, max: number) => {
  const start = max - duration

  return keyframes`
    0% {
      stroke-dashoffset: ${-(start * 283) / max};
    }
    100% {
      stroke-dashoffset: -283; // Approximately 2 * PI * 45
    }
  `
}

export const CountdownWrapper = styled.div`
  --size: 172px;
  height: var(--size);
  width: var(--size);
  top: 0;
  bottom: 0;
  margin: auto;
  left: 40px;
  background: #65d9ff;
  border-radius: var(--size);
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const CircularProgress = styled.svg`
  width: 100%;
  height: 100%;
  position: absolute;
  transform: rotate(-90deg);
  padding: 8px;
`

export const CircleProgress = styled.circle<{ duration: number; max: number }>`
  fill: none;
  stroke: #012f7a;
  stroke-width: 7;
  stroke-linecap: round;
  ${({ duration, max }) =>
    css`
      animation: ${progressAnimation(duration, max)} ${duration}s linear infinite;
    `};
`

export const CountdownText = styled.div`
  font-size: 70px;
  font-weight: 600;
  color: #012f7a;
  z-index: 1;
`

export const FinishedStepContainer = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  gap: 10px;
  padding: 0;
  width: 100%;
`

export const ConclusionContent = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  padding: 0;
  width: 100%;
  margin: 20px auto 0;
`

export const CowImage = styled.div`
  position: absolute;
  height: 100%;
  width: 220px;
  left: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;

  // mobile from Media

  ${Media.upToSmall()} {
    left: -50px;
    width: 200px;
  }
`

export const TokenPairTitle = styled.h3`
  position: absolute;
  right: 80px;
  bottom: 16px;
  font-size: 13px;
  font-weight: 300;
  margin: 0;
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: flex-end;

  // mobile

  ${Media.upToSmall()} {
    display: none;
  }
`

export const TokenImages = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  display: flex;
  gap: 5px;

  > div {
    border: 3px solid #65d9ff;
    box-sizing: content-box;
  }

  > div:first-child {
    margin-right: -20px;
  }
`

export const Surplus = styled.div<{ showSurplus: boolean }>`
  position: absolute;
  top: ${({ showSurplus }) => (showSurplus ? '34px' : '54px')};
  right: 20px;
  height: calc(100% - 86px);
  display: flex;
  align-items: flex-end;
  flex-flow: column wrap;
  justify-content: center;
  ${({ showSurplus }) =>
    showSurplus ? 'color: #006922;' : 'text-align: right; width: 180px;'} // Todo: Fix hardcoded color
  font-size: 23px;
  font-weight: 400;

  > b {
    font-size: 46px;
    font-weight: 700;

    ${Media.upToSmall()} {
      font-size: 32px;
    }
  }
`

export const FinishedLogo = styled.div`
  position: absolute;
  top: 16px;
  left: 20px;
  z-index: 1;
`

export const FinishedTagLine = styled.p`
  font-size: 14px;
  color: var(${UI.COLOR_PRIMARY_DARKER});
  position: absolute;
  top: 16px;
  right: 20px;
  z-index: 1;
  padding: 0;
  margin: 0;

  > b {
    font-weight: 700;
    // TODO: Activate serif font
  }
`

export const ShareButton = styled.button`
  background: #65d9ff; // Todo: Fix hardcoded color
  color: #012f7a; // Todo: Fix hardcoded color
  border: none;
  padding: 10px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 17px;
  z-index: 2;
  position: absolute;
  bottom: 13px;
  left: 10px;

  // mobile

  ${Media.upToSmall()} {
    border: 1px solid var(${UI.COLOR_TEXT});
  }

  > svg {
    --size: 17px;
    width: var(--size);
    height: var(--size);
  }
`

export const TransactionStatus = styled.div<{ status?: string }>`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 21px;
  font-weight: bold;
  margin: 24px auto;
  color: ${({ status }) =>
    status === 'expired' || status === 'cancelled' ? `var(${UI.COLOR_ALERT_TEXT})` : `var(${UI.COLOR_SUCCESS_TEXT})`};

  > svg {
    --size: 28px;
    color: currentColor;
    width: var(--size);
    height: var(--size);
    background-color: ${({ status }) =>
      status === 'expired' || status === 'cancelled' ? `var(${UI.COLOR_ALERT_BG})` : `var(${UI.COLOR_SUCCESS_BG})`};
    border-radius: var(--size);
    padding: 2px;
  }
`

export const SolverRankings = styled.div`
  display: flex;
  flex-flow: column wrap;
  justify-content: center;
  align-items: center;
  width: 100%;

  > h3 {
    font-weight: 600;
    margin: 20px auto 0;
  }

  > p {
    font-size: 14px;
    color: var(${UI.COLOR_TEXT_OPACITY_70});
    padding: 0;
    margin: 10px auto 0;
  }

  > p > b {
    color: var(${UI.COLOR_TEXT_PAPER});
  }
`

export const SolverTable = styled.table`
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 4px;
  margin: 14px auto 0;
`

export const SolverTableCell = styled.td<{ isFirst?: boolean; isSecond?: boolean; isLast?: boolean }>`
  padding: 10px;
  color: inherit;

  ${({ isFirst }) =>
    isFirst &&
    css`
      border-top-left-radius: 5px;
      border-bottom-left-radius: 5px;
      padding: 10px 0 10px 10px;
    `} // isSecond
  ${({ isSecond }) =>
    isSecond &&
    css`
      padding: 10px 10px 10px 0;
    `}

  ${({ isLast }) =>
    isLast &&
    css`
      border-top-right-radius: 5px;
      border-bottom-right-radius: 5px;
      text-align: right;
    `}
`

export const SolverTableRow = styled.tr<{ isWinner: boolean }>`
  background: ${({ isWinner }) => (isWinner ? 'rgba(4, 121, 91, 0.15)' : `var(${UI.COLOR_PAPER_DARKER})`)};
  color: ${({ isWinner }) =>
    isWinner ? `${SUCCESS_COLOR}` : `var(${UI.COLOR_TEXT_OPACITY_70})`}; // TODO: Fix hardcoded color
  font-weight: ${({ isWinner }) => (isWinner ? 'bold' : 'normal')};
  font-size: 14px;
  transition: background 0.15s ease-in-out;

  &:hover {
    background: ${({ isWinner }) => (isWinner ? 'rgba(4, 121, 91, 0.15)' : `var(${UI.COLOR_PAPER_DARKEST})`)};
  }
`

export const SolverRank = styled(SolverTableCell)`
  color: inherit;
`

export const SolverInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: inherit;
`

export const SolverLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const SolverName = styled.span`
  flex-grow: 1;
  color: inherit;
`

export const TrophyIcon = styled.span`
  display: inline-block;
  margin-right: 4px;
`

export const WinningBadge = styled.span`
  width: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #007b28;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;

  > span {
    font-size: inherit;
    line-height: inherit;
  }
`

export const ViewMoreButton = styled.button`
  margin: 10px auto;
  padding: 5px 10px;
  background-color: transparent;
  border: 1px solid var(${UI.COLOR_PAPER_DARKER});
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;

  &:hover {
    background-color: var(${UI.COLOR_PAPER_DARKER});
  }
`

export const ReceivedAmount = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 4px;
  font-size: 14px;
  font-weight: normal;
  margin: 20px auto 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});

  > b {
    color: var(${UI.COLOR_TEXT_PAPER});
  }
`

export const ExtraAmount = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 14px;
  margin: 4px auto 0;
  gap: 4px;

  > i {
    color: ${SUCCESS_COLOR}; // TODO: Fix hardcoded color
    font-weight: bold;
    font-style: normal;
  }
`

export const CardWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  width: 100%;
  margin: 0 auto 16px;
  gap: 5px;
`

export const InfoCard = styled.div<{ variant: 'warning' | 'success' }>`
  flex: 1;
  padding: 20px;
  border-radius: 16px;
  background-color: ${({ variant }) => (variant === 'warning' ? '#FFF5E6' : '#E6F5ED')};
  color: ${({ variant }) => (variant === 'warning' ? '#996815' : '#1E7F4E')};
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;

  h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: bold;
  }

  p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
    text-align: center;
  }

  > svg {
    max-width: 100%;
    height: auto;
    margin: 0 auto 16px;
  }
`

export const CancellationFailedBanner = styled.div`
  background-color: var(${UI.COLOR_DANGER_BG});
  color: var(${UI.COLOR_DANGER_TEXT});
  padding: 10px;
  border-radius: 16px;
  text-align: center;
  font-size: 15px;
`
