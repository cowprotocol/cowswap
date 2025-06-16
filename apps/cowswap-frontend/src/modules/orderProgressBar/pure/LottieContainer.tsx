import { ReactNode, useRef, useEffect } from 'react'

import Lottie from 'lottie-react'
import styled from 'styled-components/macro'

const LottieWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  /* Ensure Lottie container uses full space */
  > div {
    width: 100% !important;
    height: 100% !important;
  }

  svg {
    width: 100% !important;
    height: 100% !important;
  }
`

interface FullSizeLottieProps {
  animationData: unknown
  loop?: boolean
  autoplay?: boolean
}

export function FullSizeLottie({ animationData, loop = true, autoplay = true }: FullSizeLottieProps): ReactNode {
  const lottieRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Set the correct preserveAspectRatio - this is the equivalent of object-fit: cover for SVG
    const timer = setTimeout(() => {
      if (lottieRef.current) {
        const svgElement = lottieRef.current.querySelector('svg')
        if (svgElement) {
          svgElement.setAttribute('preserveAspectRatio', 'xMidYMid slice')
        }
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  return (
    <LottieWrapper ref={lottieRef}>
      <Lottie animationData={animationData} loop={loop} autoplay={autoplay} style={{ width: '100%', height: '100%' }} />
    </LottieWrapper>
  )
}
