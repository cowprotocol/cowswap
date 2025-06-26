import IMAGE_STAR_SHINE from '@cowprotocol/assets/cow-swap/star-shine.svg'
import { SingleLetterLogoWrapper } from '@cowprotocol/tokens'
import { ButtonPrimary, Font, LinkStyledButton, Media, UI } from '@cowprotocol/ui'

import styled, { css, keyframes } from 'styled-components/macro'

import { CancelButton as CancelButtonOriginal } from 'common/pure/CancelButton'

import { ProgressImageWrapper } from '../../sharedStyled'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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

export const ProgressContainer = styled.div`
  width: 100%;
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0 0 24px;
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

export const OriginalOrderIntent = styled.span`
  display: flex;
  flex-flow: row wrap;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  background: var(${UI.COLOR_PAPER_DARKER});
  padding: 10px;
  width: 100%;
  text-align: center;
  border-radius: 0 0 21px 21px;
  gap: 5px;

  ${SingleLetterLogoWrapper} {
    background: ${({ theme }) => (theme.darkMode ? `var(${UI.COLOR_TEXT})` : `var(${UI.COLOR_PAPER_DARKEST})`)};
    color: ${({ theme }) => (theme.darkMode ? `var(${UI.COLOR_PAPER_DARKER})` : `var(${UI.COLOR_TEXT})`)};
  }
`

export const AnimatedTokensWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
  min-height: 136px;
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
  will-change: transform;
  animation: ${({ position }) => (position === 'left' ? 'appear-left' : position === 'right' ? 'appear-right' : 'none')}
    2.5s cubic-bezier(0.19, 1, 0.22, 1) forwards;
  animation-delay: ${({ position }) => (position === 'center' ? '0s' : '0.75s')};
  border: ${({ position }) =>
    position === 'right' || position === 'center' ? `8px solid var(${UI.COLOR_BLUE_300_PRIMARY})` : '0'};
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

const pulseAnimation = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(0.95);
  }
`

export const CountdownText = styled.div<{ $shouldPulse?: boolean }>`
  font-family: ${Font.familyMono};
  font-size: 68px;
  font-weight: bold;
  color: var(${UI.COLOR_BLUE});
  z-index: 1;
  font-variant-numeric: slashed-zero;
  letter-spacing: -3px;
  ${({ $shouldPulse }) =>
    $shouldPulse &&
    css`
      animation: ${pulseAnimation} 1.5s ease-in-out infinite;
    `}
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

export const SoldAmount = ReceivedAmount

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
  font-size: 15px;
  text-align: center;
`

export const CircularProgress = styled.svg`
  width: 100%;
  height: 100%;
  position: absolute;
  padding: 8px;
  transform: rotate(-90deg);
`

export const CircleProgress = styled.circle<{ startAt: number; end: number }>`
  fill: none;
  stroke: #05a1ff;
  stroke-width: 6;
  stroke-linecap: round;
  stroke-dasharray: 283; /* Approximately 2 * PI * 45 */

  ${({ startAt, end }) => css`
    animation: ${progressAnimation(startAt, end)} ${startAt}s linear infinite;
  `}
`
