import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled, { keyframes } from 'styled-components/macro'

import { Link, RecipientWrapper } from '../../styles'

const refundAnimation = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(-360deg);
  }
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
