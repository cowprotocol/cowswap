import React from 'react'
import styled, { keyframes } from 'styled-components'
import SVG from 'react-inlinesvg'
import CowLoadingSVG from 'assets/img/CoW-loading.svg'

export const WrapperCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
`

const CowAnimation = keyframes`
  0%,
  100% {
    transform: scale(0.95) translateX(1px);
    opacity: 0.4;    
  }
  50% {
    transform: scale(1);
    opacity: 1;
  }
`
export const StyledCowLoading = styled(SVG)`
  .cowLoading {
    animation: ${CowAnimation} 1.4s infinite ease-in-out;
    animation-delay: -1s;
  }
`

export const CowLoading: React.FC = () => (
  <WrapperCenter>
    <StyledCowLoading src={CowLoadingSVG} />
  </WrapperCenter>
)

export default CowLoading
