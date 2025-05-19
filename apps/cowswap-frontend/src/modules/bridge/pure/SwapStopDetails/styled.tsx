import SVG from 'react-inlinesvg'
import styled, { keyframes } from 'styled-components/macro'

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
