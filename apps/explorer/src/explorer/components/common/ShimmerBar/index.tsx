import { Color } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

const ShimmerKeyframe = keyframes`
  0% {
    background-position: 0 top;
  }
  90% {
    background-position: 300px top;
  }
  100% {
    background-position: 300px top;
  }
`

const ShimmerBar = styled.div<{ height?: number }>`
  width: 100%;
  height: ${({ height = 1.2 }): string => `${height}rem`};
  border-radius: 2px;
  color: ${Color.neutral100};
  background: ${Color.explorer_greyOpacity}
    gradient(
      linear,
      100% 0,
      0 0,
      from(${Color.explorer_greyOpacity}),
      color-stop(0.5, ${Color.explorer_borderPrimary}),
      to(${Color.explorer_gradient1})
    );
  background-position: -5rem top;
  background-repeat: no-repeat;
  animation-name: ${ShimmerKeyframe};
  animation-duration: 1.3s;
  animation-iteration-count: infinite;
  background-size: 5rem 100%;
`

export default ShimmerBar
