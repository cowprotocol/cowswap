import IMAGE_STAR_SHINE from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { LinkStyledButton, Font, Media, UI } from '@cowprotocol/ui'

import styled, { css, keyframes } from 'styled-components/macro'

import { CancelButton as CancelButtonOriginal } from '../CancelButton'

const BLUE_COLOR = '#65d9ff'

const slideAnimation = (direction: 'up' | 'down') => keyframes`
  from {
    transform: translateY(${direction === 'up' ? '20px' : '-20px'}); 
    opacity: 0; 
  }
  to { 
    transform: translateY(0); 
    opacity: ${direction === 'up' ? 0.1 : 1}; 
  }
`

const animationMixin = css<{ status: string }>`
  animation: ${({ status }) => {
      if (status === 'done') return slideAnimation('up')
      if (status === 'active') return slideAnimation('down')
      return 'none'
    }}
    1s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
`

const sweatDropAnimation = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  80% {
    transform: translateY(20px);
    opacity: 1;
  }
  100% {
    transform: translateY(40px);
    opacity: 0;
  }
`

const getOpacity = (status: string): number => {
  const opacityMap = {
    done: 0.1,
    active: 1,
    next: 0.5,
    future: 0.2,
    disabled: 0.2,
  }
  return opacityMap[status as keyof typeof opacityMap] || 1
}

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    done: '#4CAF50',
    active: '#2196F3',
    error: '#F44336',
  }
  return colorMap[status] || 'currentColor'
}

export const Icon = styled.div<{ status: string; customColor?: string }>`
  --width: 28px;
  width: var(--width);
  height: auto;
  min-width: var(--width);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  color: ${({ customColor }) => customColor || `var(${UI.COLOR_PRIMARY_LIGHTER})`};
  font-weight: bold;
  font-size: 24px;

  > svg {
    color: ${({ status }) => getStatusColor(status)};
    width: 100%;
    height: 100%;
    object-fit: contain;
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

  ${Media.upToSmall()} {
    padding: 30px 0 0;
  }
`

export const Step = styled.div<{ status: string; isFirst: boolean }>`
  display: flex;
  align-items: flex-start;
  margin: 0;
  opacity: ${({ status }) => getOpacity(status)};
  transition: opacity 0.35s cubic-bezier(0.19, 1, 0.22, 1);
  ${animationMixin}
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

  > button {
    font-weight: 700;
    text-decoration: underline;
  }
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

export const ProgressImageWrapper = styled.div<{ bgColor?: string; padding?: string; height?: string; gap?: string }>`
  width: 100%;
  height: ${({ height }) => height || '246px'};
  max-height: 246px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
  border-radius: 21px;
  padding: ${({ padding }) => padding || '0'};
  gap: ${({ gap }) => gap || '0'};
  background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKER})`};
  transition: all 0.3s ease-in-out;
  position: relative;
  overflow: hidden;

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
  flex-flow: row wrap;
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
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 0;
  left: 0;
  margin: auto;
  animation: ${({ position }) => (position === 'left' ? 'appear-left' : position === 'right' ? 'appear-right' : 'none')}
    2.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  animation-delay: ${({ position }) => (position === 'center' ? '0s' : '0.75s')};
  border: ${({ position }) => (position === 'right' ? `8px solid ${BLUE_COLOR}` : '0')};
  box-sizing: content-box;
  background: ${({ position }) => (position === 'right' ? `var(${UI.COLOR_PRIMARY})` : 'transparent')};

  ${({ position }) =>
    position === 'right' &&
    css`
      &::after {
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
      }
    `}

  > span {
    padding: ${({ position }) => (position === 'right' ? '45px 40px 34px' : '0')};
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

export const CountdownWrapper = styled.div`
  margin: auto;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 71px;
  width: 150px;
  top: initial;
  left: 0;
  bottom: 52px;

  ${Media.upToSmall()} {
    background: #05a1ff;
    bottom: 0;
    border-top-right-radius: 16px;
  }
`

export const CountdownText = styled.div`
  font-family: ${Font.familyMono};
  font-size: 70px;
  font-weight: bold;
  color: var(${UI.COLOR_BLUE});
  z-index: 1;
  font-variant-numeric: slashed-zero;
`

export const FinishedStepContainer = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  gap: 10px;
  padding: 0;
  width: 100%;

  ${Media.upToSmall()} {
    flex-flow: column-reverse;
    gap: 30px;

    ${ProgressImageWrapper} {
      height: auto;
      max-height: initial;
      flex-flow: column-reverse;
    }
  }
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
  height: 100%;
  width: auto;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  position: relative;

  ${Media.upToSmall()} {
    width: 100%;
    align-items: center;
    justify-content: center;
  }

  > svg {
    height: 100%;
    width: 100%;
    max-width: 199px;

    ${Media.upToSmall()} {
      max-width: 100%;
    }
  }
`

export const TokenPairTitle = styled.span`
  margin: 0 0 0 4px;
  background: #99ecff;
  border-radius: 12px;
  padding: 3px 6px;
  word-break: break-all;

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
  font-size: 1em;
  font-weight: ${({ showSurplus }) => (showSurplus ? 'bold' : 'normal')};
  color: inherit;
  width: 100%;
  text-align: left;
  line-height: 1.2;
  margin: 0;
  display: grid;

  span {
    grid-area: 1 / 1 / 2 / 2;
    white-space: nowrap;
  }

  &::after {
    content: attr(data-content);
    display: block;
    font-weight: bold;
    height: 0;
    overflow: hidden;
    visibility: hidden;
    grid-area: 1 / 1 / 2 / 2;
  }
`

export const FinishedTagLine = styled.div`
  line-height: 1.7;
  font-weight: bold;
  color: inherit;
  max-width: 100%;
  font-size: 22px;
  width: 100%;
  text-align: right;
  height: 100%;
  display: flex;
  align-items: center;
  overflow: hidden;
  padding: 0;
`

export const FinishedLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
  padding: 0;
  margin: 0;
  position: absolute;
  bottom: 10px;
  left: 10px;
  width: calc(100% - 20px);

  > b {
    font-weight: 700;
  }
`

export const ShareButton = styled.button`
  background: var(${UI.COLOR_PRIMARY});
  color: var(${UI.COLOR_BUTTON_TEXT});
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
  left: 6px;
  right: 0;
  bottom: 6px;
  width: calc(100% - 12px);
  transition: background 0.15s ease-in-out, color 0.15s ease-in-out;

  &:hover {
    background: var(${UI.COLOR_BUTTON_TEXT});
    color: var(${UI.COLOR_PRIMARY});
  }

  ${Media.upToSmall()} {
    border: 1px solid var(${UI.COLOR_TEXT});
    justify-content: center;
  }

  > svg {
    --size: 17px;
    width: var(--size);
    height: var(--size);

    ${Media.upToSmall()} {
      max-width: 100%;
    }
  }
`

export const TransactionStatus = styled.div<{ status?: string; flexFlow?: string; gap?: string; margin?: string }>`
  display: flex;
  flex-flow: ${({ flexFlow }) => flexFlow || 'row wrap'};
  align-items: center;
  gap: ${({ gap }) => gap || '10px'};
  font-size: 21px;
  font-weight: bold;
  margin: ${({ margin }) => margin || '14px auto 0'};
  color: ${({ status }) =>
    status === 'expired' || status === 'cancelled'
      ? `var(${UI.COLOR_ALERT_TEXT})`
      : status === 'success'
      ? `var(${UI.COLOR_SUCCESS_TEXT})`
      : `var(${UI.COLOR_TEXT})`};

  > svg {
    --size: 28px;
    color: currentColor;
    width: var(--size);
    height: var(--size);
    background-color: ${({ status }) =>
      status === 'expired' || status === 'cancelled'
        ? `var(${UI.COLOR_ALERT_BG})`
        : status === 'success'
        ? `var(${UI.COLOR_SUCCESS_BG})`
        : 'transparent'};
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

export const SolverTableCell = styled.td`
  padding: 10px;
  color: inherit;

  &:first-child {
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    padding: 10px 0 10px 10px;
  }

  &:last-child {
    border-top-right-radius: 5px;
    border-bottom-right-radius: 5px;
    text-align: right;
  }
`

export const SolverTableRow = styled.tr<{ isWinner: boolean }>`
  background: ${({ isWinner }) => (isWinner ? `var(${UI.COLOR_SUCCESS_BG})` : `var(${UI.COLOR_PAPER_DARKER})`)};
  color: ${({ isWinner }) => (isWinner ? `var(${UI.COLOR_SUCCESS_TEXT})` : `var(${UI.COLOR_TEXT})`)};
  font-weight: ${({ isWinner }) => (isWinner ? 'bold' : 'normal')};
  font-size: 14px;
  transition: background 0.15s ease-in-out;

  &:hover {
    background: ${({ isWinner }) => (isWinner ? `var(${UI.COLOR_SUCCESS_BG})` : `var(${UI.COLOR_PAPER_DARKEST})`)};
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
  text-transform: capitalize;
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
  background: var(${UI.COLOR_SUCCESS_BG});
  color: var(${UI.COLOR_SUCCESS_TEXT});
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
  border: 1px solid var(${UI.COLOR_TEXT_OPACITY_70});
  color: var(${UI.COLOR_TEXT});
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
    color: var(${UI.COLOR_SUCCESS_TEXT});
    font-weight: bold;
    font-style: normal;
  }
`

export const CardWrapper = styled.div`
  display: flex;
  flex-flow: row wrap;
  align-items: flex-start;
  width: 100%;
  margin: 0 auto 16px;
  gap: 5px;
`

export const InfoCard = styled.div<{ variant: 'warning' | 'success' }>`
  flex: 1;
  padding: 20px;
  border-radius: 16px;
  background-color: ${({ variant }) =>
    variant === 'warning' ? `var(${UI.COLOR_ALERT_BG})` : `var(${UI.COLOR_SUCCESS_BG})`};
  color: ${({ variant }) => (variant === 'warning' ? `var(${UI.COLOR_ALERT_TEXT})` : `var(${UI.COLOR_SUCCESS_TEXT})`)};
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;

  > h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: bold;
  }

  > p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
    text-align: center;
  }

  > p > a {
    color: inherit;
    text-decoration: underline;
  }

  > svg {
    max-width: 100%;
    height: auto;
    margin: 0 auto 16px;

    > path:last-child {
      ${({ theme, variant }) =>
        theme.darkMode &&
        css`
          fill: ${variant === 'warning' ? `var(${UI.COLOR_ALERT_TEXT})` : `var(${UI.COLOR_SUCCESS_TEXT})`};
        `}
    }
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

const spinAnimation = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const SpinnerIcon = styled.div`
  width: var(--width);
  height: var(--width);
  animation: ${spinAnimation} 1s linear infinite;

  > svg {
    width: 100%;
    height: 100%;
    color: inherit;
  }
`

export const SweatDrop = styled.div`
  color: #ffffff;
  position: absolute;
  left: 160px;
  top: 75px;
  width: 15px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${sweatDropAnimation} 2s cubic-bezier(0.19, 1, 0.22, 1) infinite;

  > svg {
    width: 100%;
    height: 100%;
    color: inherit;
  }
`

export const ClockAnimation = styled.div`
  --size: 85px;
  width: var(--size);
  height: var(--size);
  position: absolute;
  bottom: 36px;
  right: 71px;
  background: #996815;
  border-radius: var(--size);
  padding: 6px;
  display: flex;
  align-items: center;
  justify-content: center;

  ${Media.upToSmall()} {
    bottom: 16px;
    right: 16px;
  }
`

export const FinishedImageContent = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 50%;
  position: relative;
  border: 2px solid #99ecff;
  border-radius: 21px;
  padding: 14px 14px 40px;
  color: ${({ theme }) => (theme.darkMode ? `var(${UI.COLOR_BUTTON_TEXT})` : `var(${UI.COLOR_TEXT})`)};

  ${Media.upToSmall()} {
    width: 100%;
  }
`

export const BenefitSurplusContainer = styled.div`
  width: 100%;
  height: 98%;
  display: flex;
  align-items: center;
  justify-content: center;

  > span {
    width: 100%;
    text-align: left;
  }
`

export const BenefitText = styled.span<{ fontSize: number }>`
  font-size: ${({ fontSize }) => `${fontSize}px`};
  line-height: 1.2;
  text-align: left;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
`
