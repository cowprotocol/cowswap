import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled, { keyframes } from 'styled-components/macro'

import { Link, RecipientWrapper } from '../../styles'
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

const StatusAwareColors: Record<StopStatusEnum, string> = {
  [StopStatusEnum.PENDING]: `var(${UI.COLOR_INFO_TEXT})`,
  [StopStatusEnum.FAILED]: `var(${UI.COLOR_DANGER_TEXT})`,
  [StopStatusEnum.DONE]: `var(${UI.COLOR_SUCCESS})`,
  [StopStatusEnum.REFUND_COMPLETE]: `var(${UI.COLOR_SUCCESS})`,
  [StopStatusEnum.DEFAULT]: `var(${UI.COLOR_TEXT})`,
}

export const StatusAwareText = styled.span<{ status?: StopStatusEnum }>`
  color: ${({ status = StopStatusEnum.DEFAULT }) => StatusAwareColors[status]};
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
  color: var(${UI.COLOR_SUCCESS});
`

export const StyledStatusCloseIcon = styled(SVG)`
  color: var(${UI.COLOR_DANGER_TEXT});
  width: 18px;
  height: 18px;
`

export const StyledTimelineCheckmarkIcon = styled(SVG)`
  width: 14px;
  height: 14px;
  color: var(${UI.COLOR_SUCCESS});

  > path {
    fill: currentColor;
  }
`

export const StyledAnimatedTimelineRefundIcon = styled(SVG)`
  width: 14px;
  height: 14px;
  fill: currentColor;
  display: block;
  transform-origin: center;
  animation: ${refundAnimation} 3s cubic-bezier(0.25, 0.1, 0.25, 1) infinite;
  color: var(${UI.COLOR_INFO_TEXT});
  min-width: 0;
`

export const RefundLink = styled(Link)`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`

export const RefundRecipientWrapper = styled(RecipientWrapper)`
  width: 100%;
  min-width: 0;
`

export const DangerText = styled.span`
  color: var(${UI.COLOR_DANGER_TEXT});
`
