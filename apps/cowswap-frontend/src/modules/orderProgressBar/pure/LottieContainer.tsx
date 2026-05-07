import { ReactNode, useRef, useEffect, lazy, Suspense } from 'react'

import { MEDIA_WIDTHS } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

const Lottie = lazy(() => import('lottie-react'))
const LARGE_PHONE_MIN_WIDTH = 414
const LARGE_MOBILE_MEDIA_QUERY = `@media (min-width: ${LARGE_PHONE_MIN_WIDTH}px) and (max-width: ${MEDIA_WIDTHS.upToSmall}px)`

const LottieWrapper = styled.div<{ $largePhoneScale: number }>`
  --size: 100%;
  --mobile-animation-scale: 1;
  width: var(--size);
  height: var(--size);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  ${LARGE_MOBILE_MEDIA_QUERY} {
    /*
     * Max/Plus phones keep the short mobile top-section height but get a noticeably wider card.
     * The Lottie artwork itself has generous safe margins, so zoom the animation slightly on those
     * phones instead of shrinking the whole stage and introducing side gutters.
     */
    --mobile-animation-scale: ${({ $largePhoneScale }) => $largePhoneScale};
  }

  /* Ensure Lottie container uses full space */
  > div {
    width: var(--size) !important;
    height: var(--size) !important;
    transform: scale(var(--mobile-animation-scale));
    transform-origin: center;
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
  largePhoneScale?: number
}

export function FullSizeLottie({
  animationData,
  loop = true,
  autoplay = true,
  largePhoneScale = 1,
}: FullSizeLottieProps): ReactNode {
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
    <LottieWrapper ref={lottieRef} $largePhoneScale={largePhoneScale}>
      {/* TODO: what fallback should be used here? */}
      <Suspense fallback={null}>
        <Lottie
          animationData={animationData}
          loop={loop}
          autoplay={autoplay}
          style={{ width: '100%', height: '100%' }}
        />
      </Suspense>
    </LottieWrapper>
  )
}
