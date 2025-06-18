import { ReactNode, useRef, useEffect } from 'react'

import Lottie from 'lottie-react'
import styled from 'styled-components/macro'

const LottieWrapper = styled.div`
  --size: 100%;
  width: var(--size);
  height: var(--size);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  /* Ensure Lottie container uses full space */
  > div {
    width: var(--size) !important;
    height: var(--size) !important;
  }

  svg {
    width: var(--size) !important;
    height: var(--size) !important;
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
    const applyPreserveAspectRatio = (): boolean => {
      if (lottieRef.current) {
        const svgElement = lottieRef.current.querySelector('svg')
        if (svgElement) {
          svgElement.setAttribute('preserveAspectRatio', 'xMidYMid slice')
          return true
        }
      }
      return false
    }

    // Try to apply immediately, if that fails schedule for next frame
    if (applyPreserveAspectRatio()) {
      return
    }

    // If SVG not ready, schedule for next frame
    const frameId = requestAnimationFrame(() => {
      applyPreserveAspectRatio()
    })

    return () => cancelAnimationFrame(frameId)
  }, [animationData])

  return (
    <LottieWrapper ref={lottieRef}>
      <Lottie animationData={animationData} loop={loop} autoplay={autoplay} style={{ width: '100%', height: '100%' }} />
    </LottieWrapper>
  )
}
