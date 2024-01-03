import styled, { keyframes } from 'styled-components'

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
  color: white;
  background: ${({ theme }): string =>
    `${theme.greyOpacity} -webkit-gradient(linear, 100% 0, 0 0, from(${theme.greyOpacity}), color-stop(0.5, ${theme.borderPrimary}), to(${theme.gradient1}))`};
  background-position: -5rem top;
  background-repeat: no-repeat;
  -webkit-animation-name: ${ShimmerKeyframe};
  -webkit-animation-duration: 1.3s;
  -webkit-animation-iteration-count: infinite;
  -webkit-background-size: 5rem 100%;
`

export default ShimmerBar
