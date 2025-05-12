import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled, { keyframes } from 'styled-components/macro'

import { Link } from '../../styles'
import { StopStatusEnum } from '../../utils/status'

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

const refundAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
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

export const StatusAwareText = styled.span<{ status?: StopStatusEnum }>`
  color: ${({ status }) => {
    switch (status) {
      case StopStatusEnum.PENDING:
        return `var(${UI.COLOR_INFO_TEXT})`
      case StopStatusEnum.FAILED:
        return `var(${UI.COLOR_DANGER_TEXT})`
      case StopStatusEnum.DONE:
      case StopStatusEnum.REFUND_COMPLETE:
        return `var(${UI.COLOR_SUCCESS_TEXT})`
      default:
        return `var(${UI.COLOR_TEXT})`
    }
  }};
`

export const AnimatedEllipsis = styled.span`
  display: inline-block;
  width: 0.8em;
  text-align: left;
  vertical-align: bottom;

  &::after {
    content: '.';
    animation: ${ellipsisAnimation} 2s infinite steps(1);
    display: inline-block;
  }
`

export const StyledStatusCheckmarkIcon = styled(SVG)`
  width: 24px;
  height: 18px;
  color: var(${UI.COLOR_SUCCESS_TEXT});
`

export const StyledStatusCloseIcon = styled(SVG)`
  color: var(${UI.COLOR_DANGER_TEXT});
  width: 18px;
  height: 18px;
`

export const StyledTimelineCheckmarkIcon = styled(SVG)`
  width: 14px;
  height: 14px;
  color: var(${UI.COLOR_SUCCESS_TEXT});

  > path {
    fill: currentColor;
  }
`

export const InfoTextSpan = styled.span`
  color: var(${UI.COLOR_INFO_TEXT});
`

export const InfoTextBold = styled.b`
  color: var(${UI.COLOR_INFO_TEXT});
`

export const SuccessTextBold = styled.b`
  color: var(${UI.COLOR_SUCCESS_TEXT});
`

export const RefundSuccessTextBold = styled(SuccessTextBold)`
  display: flex;
  align-items: center;
  width: 100%;
  min-width: 0;
`

export const StyledRefundCompleteIcon = styled(SVG)`
  width: 16px;
  height: 16px;
  fill: currentColor;
  display: block;
  transform-origin: center;
  animation: ${refundCompleteAnimation} 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) forwards;
`

export const StyledAnimatedTimelineRefundIcon = styled(SVG)`
  width: 14px;
  height: 14px;
  fill: currentColor;
  display: block;
  transform-origin: center;
  animation: ${refundAnimation} 3s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
  color: var(${UI.COLOR_INFO_TEXT});
`

export const RefundLink = styled(Link)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`

export const RecipientWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`

export const RefundRecipientWrapper = styled(RecipientWrapper)`
  width: 100%;
  min-width: 0;
  padding: 0 0 0 3px;
`

export const NetworkLogoWrapper = styled.div<{ size?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  width: ${({ size = 16 }) => size}px;
  height: ${({ size = 16 }) => size}px;
  overflow: hidden;

  > img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: contain;
  }
`

export const TimelineIconCircleWrapper = styled.span`
  --size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  padding: 3px;
  background-color: var(${UI.COLOR_SUCCESS_BG});
`

export const DangerText = styled.span`
  color: var(${UI.COLOR_DANGER_TEXT});
`
