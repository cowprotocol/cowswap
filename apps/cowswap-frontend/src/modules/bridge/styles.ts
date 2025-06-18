import { Media, UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import { FlattenSimpleInterpolation } from 'styled-components'
import styled, { css, keyframes } from 'styled-components/macro'

import { ARROW_ICON_SIZE } from 'common/pure/ToggleArrow/styled'

import { SwapAndBridgeStatus } from './types'

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`

const ellipsisAnimation = keyframes`
  0%, 100% {
    content: '.';
  }
  25% {
    content: '..';
  }
  50% {
    content: '...';
  }
  75% {
    content: '';
  }
`

export const StyledSpinnerIcon = styled(SVG)`
  transform-origin: center;
  animation: ${spin} 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) infinite;
`

const stopCircleBase = css`
  --size: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  border-radius: 50%;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  font-size: 13px;
  flex-shrink: 0;
  position: relative;

  > svg {
    width: calc(var(--size) - 5px);
    height: calc(var(--size) - 5px);
    display: block;

    path {
      fill: currentColor;
    }
  }
`

const StopStatusStyles: Record<SwapAndBridgeStatus, FlattenSimpleInterpolation> = {
  [SwapAndBridgeStatus.DONE]: css`
    background-color: var(${UI.COLOR_SUCCESS_BG});
    color: var(${UI.COLOR_SUCCESS});
    padding: 6px;
    &::before {
      content: none;
    }
  `,
  [SwapAndBridgeStatus.PENDING]: css`
    background-color: ${`var(${UI.COLOR_INFO_BG})`};
    color: ${`var(${UI.COLOR_INFO_TEXT})`};
    &::before {
      content: none;
    }
  `,
  [SwapAndBridgeStatus.FAILED]: css`
    background-color: var(${UI.COLOR_ALERT_BG});
    color: var(${UI.COLOR_ALERT_TEXT});
    padding: 6.5px;
    &::before {
      content: none;
    }
  `,
  [SwapAndBridgeStatus.REFUND_COMPLETE]: css`
    background-color: var(${UI.COLOR_ALERT_BG});
    color: var(${UI.COLOR_ALERT_TEXT});
    padding: 6.5px;
    &::before {
      content: none;
    }
  `,
  [SwapAndBridgeStatus.DEFAULT]: css`
    background-color: var(${UI.COLOR_TEXT_OPACITY_15});
    color: var(${UI.COLOR_TEXT});
  `,
}

export const StopNumberCircle = styled.div<{
  status?: SwapAndBridgeStatus
  stopNumber?: number
}>`
  ${stopCircleBase}

  ${({ status = SwapAndBridgeStatus.DEFAULT }) => StopStatusStyles[status]}

  ${({ status = SwapAndBridgeStatus.DEFAULT, stopNumber }) =>
    status === SwapAndBridgeStatus.DEFAULT &&
    stopNumber &&
    css`
      &::before {
        content: '${stopNumber}';
      }
    `}
`

export const StopTitle = styled.div`
  display: flex;
  flex-flow: row wrap;
  width: 100%;
  align-items: center;
  gap: 6px;
  margin: 0 0 0 -4px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
  font-size: 14px;
  position: relative;

  ${Media.upToSmall()} {
    font-size: 13px;
  }

  > b {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    letter-spacing: -0.1px;

    ${Media.upToSmall()} {
      padding: 0 24px 0 0;
    }
  }
`

export const TokenFlowContainer = styled.div`
  display: flex;
  align-items: center;
  flex-flow: row wrap;
  gap: 4px;
  margin: 0 auto 0 0;
  width: 100%;
`

export const ArrowIcon = styled.span`
  font-size: 13px;
  line-height: 1;
`

export const ToggleIconContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 0 0 0 auto;
  padding: 6px;
  border-radius: ${ARROW_ICON_SIZE};
  cursor: pointer;
  transition:
    background var(${UI.ANIMATION_DURATION}) ease-in-out,
    opacity var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    opacity: 0.8;
    background: var(${UI.COLOR_PAPER_DARKEST});
  }

  ${Media.upToSmall()} {
    position: absolute;
    right: 0px;
    top: 13px;
    transform: translateY(-13px);
    margin-left: 0;
  }
`

export const SectionContent = styled.div<{ isExpanded: boolean }>`
  display: ${({ isExpanded }) => (isExpanded ? 'flex' : 'none')};
  flex-flow: column wrap;
  gap: 4px;
  padding: 0 0 0 1px;
  font-size: 13px;
  width: 100%;
  overflow: hidden;
  transition:
    max-height var(${UI.ANIMATION_DURATION}) ease-in-out,
    opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  max-height: ${({ isExpanded }) => (isExpanded ? '1000px' : '0')};
  opacity: ${({ isExpanded }) => (isExpanded ? 1 : 0)};
`

export const Link = styled.a<{ underline?: boolean }>`
  text-decoration: ${({ underline }) => (underline ? 'underline' : 'none')};
  color: inherit;

  &:hover {
    text-decoration: underline;
  }
`

export const SuccessTextBold = styled.b`
  color: var(${UI.COLOR_SUCCESS});
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  gap: 2px;
`

export const InfoTextSpan = styled.span`
  color: var(${UI.COLOR_INFO_TEXT});
`

export const InfoTextBold = styled.b`
  color: var(${UI.COLOR_INFO_TEXT});
`

export const DividerHorizontal = styled.div<{ margin?: string; overrideColor?: string }>`
  width: 100%;
  height: 1px;
  margin: ${({ margin }) => margin || '0'};
  background-color: ${({ overrideColor }) => overrideColor || `var(${UI.COLOR_PAPER_DARKER})`};
`

const refundCompleteAnimation = keyframes`
  0% {
    transform: rotate(0deg) scale(1);
    animation-timing-function: ease-in;
  }
  30% {
    transform: rotate(-720deg) scale(1);
    animation-timing-function: ease-out;
  }
  85% {
    transform: rotate(-1080deg) scale(1.15);
    animation-timing-function: ease-in;
  }
  100% {
    transform: rotate(-1080deg) scale(1);
  }
`

export const StyledRefundCompleteIcon = styled(SVG)`
  width: 16px;
  height: 16px;
  fill: currentColor;
  display: block;
  transform-origin: center;
  animation: ${refundCompleteAnimation} 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
`

export const RecipientWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

export const TimelineIconCircleWrapper = styled.span`
  --size: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  padding: 3px;
  background-color: var(${UI.COLOR_SUCCESS_BG});
`

export const StyledTimelinePlusIcon = styled(SVG)`
  --size: 100%;
  width: var(--size);
  height: var(--size);
  color: var(${UI.COLOR_SUCCESS});

  > path {
    fill: currentColor;
  }
`

const StatusAwareColors: Record<SwapAndBridgeStatus, string> = {
  [SwapAndBridgeStatus.PENDING]: `var(${UI.COLOR_INFO_TEXT})`,
  [SwapAndBridgeStatus.FAILED]: `var(${UI.COLOR_DANGER_TEXT})`,
  [SwapAndBridgeStatus.DONE]: `var(${UI.COLOR_SUCCESS})`,
  [SwapAndBridgeStatus.REFUND_COMPLETE]: `var(${UI.COLOR_SUCCESS})`,
  [SwapAndBridgeStatus.DEFAULT]: `var(${UI.COLOR_TEXT})`,
}

export const StatusAwareText = styled.span<{ status?: SwapAndBridgeStatus }>`
  color: ${({ status = SwapAndBridgeStatus.DEFAULT }) => StatusAwareColors[status]};
`

/**
 * Animated ellipsis component that can be conditionally animated
 * This helps reduce unnecessary animation calculations when not visible
 */
export const AnimatedEllipsis = styled.span<{ isVisible?: boolean }>`
  display: inline-block;
  width: 0.8em;
  text-align: left;
  vertical-align: bottom;

  &::after {
    content: '.';
    animation: ${({ isVisible = true }) =>
      isVisible
        ? css`
            ${ellipsisAnimation} 2s infinite steps(1)
          `
        : 'none'};
    display: inline-block;
  }
`

export const DangerText = styled.span`
  color: var(${UI.COLOR_DANGER_TEXT});
`

export const ClickableStopTitle = styled(StopTitle)<{ isCollapsible?: boolean }>`
  cursor: ${({ isCollapsible }) => (isCollapsible ? 'pointer' : 'default')};

  &:hover {
    opacity: ${({ isCollapsible }) => (isCollapsible ? 0.8 : 1)};
  }
`

export const ExplorerLink = styled.a`
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-decoration: underline;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover {
    color: var(${UI.COLOR_TEXT});
  }

  ${Media.upToSmall()} {
    order: 5;
    margin: 10px auto;
    font-size: 13px;
    background: var(${UI.COLOR_INFO_BG});
    color: var(${UI.COLOR_INFO_TEXT});
    width: 100%;
    padding: 8px;
    border-radius: 8px;
    text-align: center;
    text-decoration: none;
    cursor: pointer;
  }
`
