import IMAGE_STAR_SHINE from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { SingleLetterLogoWrapper } from '@cowprotocol/tokens'
import { ButtonPrimary, Font, LinkStyledButton, Media, UI } from '@cowprotocol/ui'

import styled, { css, keyframes } from 'styled-components/macro'

import { CancelButton as CancelButtonOriginal } from '../CancelButton'

const BLUE_COLOR = '#65d9ff'

const progressAnimation = (startAt: number, end: number) => {
  const start = end - startAt

  return keyframes`
    0% {
      stroke-dashoffset: ${-(start * 283) / end};
    }
    100% {
      stroke-dashoffset: -283; // Approximately 2 * PI * 45
    }
  `
}

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

const getOpacity = (status: string, isDarkMode: boolean): number => {
  const opacityMap = {
    done: isDarkMode ? 0.3 : 0.1,
    active: 1,
    next: isDarkMode ? 0.6 : 0.5,
    future: isDarkMode ? 0.3 : 0.2,
    disabled: 0.2,
  }
  return opacityMap[status as keyof typeof opacityMap] || 1
}

export const ProgressContainer = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 0 24px;
`

export const StepsContainer = styled.div<{ $height: number; $minHeight?: string; bottomGradient?: boolean }>`
  position: relative;
  height: ${({ $height }) => $height}px;
  min-height: ${({ $minHeight }) => $minHeight || '192px'};
  overflow: hidden;
  transition: height 0.5s ease-in-out;
  width: 100%;
  padding: 0;

  // implement a gradient to hide the bottom of the steps container using white to opacity white using pseudo element
  &::after {
    content: ${({ bottomGradient }) => (bottomGradient ? '""' : 'none')};
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 30px;
    background: linear-gradient(to bottom, transparent, var(${UI.COLOR_PAPER}));
  }
`

export const StepsWrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  padding: 0;
  width: 100%;
  position: relative;
  transition: transform 1s ease-in-out;
`

export const Step = styled.div<{ status: string; isFirst: boolean }>`
  transition: opacity 0.3s ease-in-out;
  display: flex;
  align-items: flex-start;
  margin: 0 auto;
  width: 100%;
  padding: 30px 30px 10px;
  opacity: ${({ status, theme }) => getOpacity(status, theme.darkMode)};
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

  > button,
  > a {
    text-decoration: underline;
    color: var(${UI.COLOR_TEXT_PAPER});
  }
`

export const Link = styled.a<{ underline?: boolean }>`
  color: var(${UI.COLOR_TEXT_PAPER});
  text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  font-size: 14px;
  margin: 8px 0 0;
  display: inline;
  line-height: 1.4;

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
  min-height: 200px;
  max-height: ${({ height }) => height || '246px'};
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column wrap;
  border-radius: 21px;
  padding: ${({ padding }) => padding || '0'};
  gap: ${({ gap }) => gap || '0'};
  background: ${({ bgColor }) => bgColor || `var(${UI.COLOR_PAPER_DARKER})`};
  transition: height 0.3s ease-in-out;
  position: relative;
  overflow: hidden;

  ${Media.upToSmall()} {
    min-height: auto;
    height: auto;
  }

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

  > div {
    display: flex;
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

export const ProgressTopSection = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  border-radius: 21px;
  background: var(${UI.COLOR_PAPER_DARKER});
  min-height: 230px;

  ${Media.upToSmall()} {
    min-height: auto;
  }
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

  ${SingleLetterLogoWrapper} {
    background: ${({ theme }) => (theme.darkMode ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_PAPER_DARKEST})`)};
    color: ${({ theme }) => (theme.darkMode ? `var(${UI.COLOR_PAPER_DARKER})` : `var(${UI.COLOR_TEXT})`)};
  }
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

export const TokenWrapper = styled.div<{
  position: 'left' | 'center' | 'right'
  bgColor?: string
  size: number
  sizeMobile: number
}>`
  --size: ${({ size }) => (size ? `${size}px` : '136px')};
  --sizeMobile: ${({ sizeMobile }) => (sizeMobile ? `${sizeMobile}px` : 'var(--size)')};
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
  border: ${({ position }) => (position === 'right' || 'center' ? `8px solid ${BLUE_COLOR}` : '0')};
  box-sizing: content-box;
  background: ${({ position, bgColor }) =>
    position === 'right' ? bgColor || `var(${UI.COLOR_PRIMARY})` : 'transparent'};

  ${Media.upToSmall()} {
    height: var(--sizeMobile);
    width: var(--sizeMobile);
    border-radius: var(--sizeMobile);
  }

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

        ${Media.upToSmall()} {
          --size: 18px;
        }
      }
    `}

  @keyframes appear-left {
    to {
      transform: translateX(calc(var(--size) / -2));
    }
  }

  @keyframes appear-right {
    to {
      transform: translateX(calc(var(--size) / 2));
    }
  }

  ${Media.upToSmall()} {
    @keyframes appear-left {
      to {
        transform: translateX(calc(var(--sizeMobile) / -2));
      }
    }

    @keyframes appear-right {
      to {
        transform: translateX(calc(var(--sizeMobile) / 2));
      }
    }
  }
`

export const CountdownWrapper = styled.div`
  --size: 160px;
  height: var(--size);
  width: var(--size);
  top: 0;
  bottom: 0;
  margin: auto;
  left: 40px;
  background: #66d9ff;
  border-radius: var(--size);
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
`

export const CountdownText = styled.div`
  font-family: ${Font.familyMono};
  font-size: 68px;
  font-weight: bold;
  color: var(${UI.COLOR_BLUE});
  z-index: 1;
  font-variant-numeric: slashed-zero;
  letter-spacing: -3px;
`

export const FinishedStepContainer = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  gap: 16px;
  padding: 0;
  width: 100%;

  ${Media.upToSmall()} {
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
    max-height: 100%;
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
  margin: 4px 0 4px 4px;
  background: #99ecff;
  border-radius: 12px;
  padding: 0 6px;
  word-break: break-word;
  line-height: 1;
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

export const Surplus = styled.div`
  font-weight: bold;
  color: inherit;
  width: 100%;
  height: 100%;
  text-align: right;
  line-height: 1.2;
  margin: 0;
`

export const FinishedTagLine = styled.div`
  line-height: 1.2;
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
  flex: 1 1 0;

  ${Media.upToSmall()} {
    flex: 0 0 auto;
    height: auto;
  }
`

export const FinishedLogo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1;
  padding: 0;
  margin: auto 0 0;
  width: 100%;
  flex: 0;

  > b {
    font-weight: 700;
  }
`

export const ShareButton = styled(ButtonPrimary)`
  gap: 10px;

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
  margin: 32px auto 0;

  > h3 {
    font-size: 17px;
    font-weight: 600;
    margin: 0;
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
  display: flex;
  align-items: center;

  > span {
    margin-left: 4px;
  }
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
  white-space: pre;

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

export const ReceivedAmount = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 4px;
  font-size: 15px;
  font-weight: normal;
  margin: 0 auto 10px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});

  > b {
    color: var(${UI.COLOR_TEXT_PAPER});
  }
`

export const SoldAmount = styled(ReceivedAmount)``

export const ExtraAmount = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  font-size: 15px;
  margin: 0 auto;
  gap: 4px;

  > i {
    color: var(${UI.COLOR_SUCCESS_TEXT});
    font-weight: bold;
    font-style: normal;
  }
`

export const CardWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  flex-flow: row wrap;
  align-items: stretch;
  width: 100%;
  margin: 0 auto 16px;
  gap: 5px;
`

export const InfoCard = styled.div<{ variant: 'warning' | 'success' }>`
  display: flex;
  flex-flow: column;
  align-items: center;
  justify-content: flex-start;
  padding: 20px;
  border-radius: 16px;
  background-color: ${({ variant }) =>
    variant === 'warning' ? `var(${UI.COLOR_ALERT_BG})` : `var(${UI.COLOR_SUCCESS_BG})`};
  color: ${({ variant }) => (variant === 'warning' ? `var(${UI.COLOR_ALERT_TEXT})` : `var(${UI.COLOR_SUCCESS_TEXT})`)};
  height: 100%;
  box-sizing: border-box;

  > h3 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: bold;
    text-align: center;
  }

  > p {
    margin: 0;
    font-size: 14px;
    line-height: 1.4;
    text-align: center;
  }

  > p > a,
  > p > button {
    color: inherit;
    text-decoration: underline;
    padding: 0;

    &:hover {
      text-decoration: underline;
    }
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
  margin: 0 auto;
  border-radius: 16px;
  text-align: center;
  font-size: 15px;
`

export const NumberedElement = styled.div<{
  status: string
  customColor?: string
  $isUnfillable?: boolean
  $isCancelling?: boolean
}>`
  --size: 28px;
  width: var(--size);
  height: var(--size);
  min-width: var(--size);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
  color: ${({ status }) => (status === 'active' ? `var(${UI.COLOR_PAPER})` : `var(${UI.COLOR_PAPER})`)};
  font-weight: bold;
  font-size: 16px;
  background-color: ${({ status, customColor, $isUnfillable, $isCancelling }) =>
    $isCancelling
      ? `var(${UI.COLOR_DANGER_BG})`
      : $isUnfillable
        ? '#996815'
        : customColor || (status === 'active' ? '#2196F3' : `var(${UI.COLOR_TEXT})`)};
  border-radius: 50%;
  position: relative;
`

export const Spinner = styled.div`
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid transparent;
  border-top-color: ${`var(${UI.COLOR_PRIMARY_LIGHTER})`};
  border-radius: 50%;
  animation: spin 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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
  padding: 12px;
  gap: 14px;
  color: ${({ theme }) => (theme.darkMode ? `var(${UI.COLOR_BUTTON_TEXT})` : `var(${UI.COLOR_TEXT})`)};

  ${Media.upToSmall()} {
    width: 100%;
    max-height: 290px;
  }
`

export const BenefitSurplusContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  justify-content: flex-start;
  gap: 0;
  font-size: 20px;
  line-height: 1.4;
`

export const BenefitText = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 6px 0 0;
  margin: 0;
  box-sizing: border-box;

  > span {
    display: inline-block;
    line-height: 1.2;
    text-align: left;
    word-break: break-word;
    hyphens: auto;
    width: 100%;
  }
`

export const BenefitTagLine = styled.div`
  width: auto;
  font-size: 14px;
  margin: 0 auto auto 0;
  border-radius: 12px;
  padding: 2px 10px;
  background-color: #3fc4ff;
  color: #000000;
`

export const CircularProgress = styled.svg`
  width: 100%;
  height: 100%;
  position: absolute;
  transform: rotate(-90deg);
  padding: 8px;
`

export const CircleProgress = styled.circle<{ startAt: number; end: number }>`
  fill: none;
  stroke: #05a1ff;
  stroke-width: 6;
  stroke-linecap: round;

  ${({ startAt, end }) => css`
    animation: ${progressAnimation(startAt, end)} ${startAt}s linear infinite;
  `};
`
