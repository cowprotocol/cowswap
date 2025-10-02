import { ReactNode, useMemo } from 'react'

import cowDarkIMG from '@cowprotocol/assets/images/404/swap/dark/cow.svg'
import saucerDarkIMG from '@cowprotocol/assets/images/404/swap/dark/saucer.svg'
import cowLightIMG from '@cowprotocol/assets/images/404/swap/light/cow.svg'
import saucerLightIMG from '@cowprotocol/assets/images/404/swap/light/saucer.svg'
import { Media } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

interface CowSaucerSceneProps {
  darkMode: boolean
}

const ANIMATION_DURATION = '10s'

const SAUCER_HORIZONTAL = {
  entry: '55vw',
  center: '0',
  exit: '-55vw',
}

const SAUCER_ROTATION = {
  entry: '-4deg',
  center: '0deg',
  exit: '6deg',
}

const COW_VERTICAL = {
  ground: '0',
  lifted: '-38%',
}

const saucerKeyframe = (offset: string, rotation: string): string =>
  `translate(-50%, 0) translateX(${offset}) rotate(${rotation})`

const cowKeyframe = (offsetX: string, offsetY: string, scale = '1'): string =>
  `translate(${offsetX}, ${offsetY}) scale(${scale})`

const cowSaucerOffset = (offset: string): string => `calc(-50% + ${offset})`

const saucerFlight = keyframes`
  0%,
  100% {
    transform: ${saucerKeyframe(SAUCER_HORIZONTAL.entry, SAUCER_ROTATION.entry)};
    opacity: 0;
  }

  12%,
  32% {
    transform: ${saucerKeyframe(SAUCER_HORIZONTAL.center, SAUCER_ROTATION.center)};
    opacity: 1;
  }

  55% {
    transform: ${saucerKeyframe(SAUCER_HORIZONTAL.exit, SAUCER_ROTATION.exit)};
    opacity: 0;
  }
`

const cowAbduction = keyframes`
  0%,
  10% {
    opacity: 1;
    transform: ${cowKeyframe('-50%', COW_VERTICAL.ground)};
  }

  18%,
  32% {
    opacity: 1;
    transform: ${cowKeyframe('-50%', COW_VERTICAL.lifted, '1.04')};
  }

  33% {
    opacity: 1;
    transform: ${cowKeyframe('-50%', COW_VERTICAL.lifted, '1.02')};
  }

  55% {
    opacity: 0.6;
    transform: ${cowKeyframe(cowSaucerOffset(SAUCER_HORIZONTAL.exit), COW_VERTICAL.lifted, '1.02')};
  }

  57% {
    opacity: 0;
    transform: ${cowKeyframe(cowSaucerOffset(SAUCER_HORIZONTAL.exit), COW_VERTICAL.lifted, '1.02')};
  }

  72%,
  80% {
    opacity: 0;
    transform: ${cowKeyframe(cowSaucerOffset(SAUCER_HORIZONTAL.entry), COW_VERTICAL.lifted, '1.02')};
  }

  88% {
    opacity: 1;
    transform: ${cowKeyframe('-50%', COW_VERTICAL.lifted, '1.02')};
  }

  100% {
    opacity: 1;
    transform: ${cowKeyframe('-50%', COW_VERTICAL.ground)};
  }
`

const SceneCanvas = styled.div`
  position: relative;
  width: min(120rem, 100vw);
  height: clamp(24rem, 32vw, 30rem);
  pointer-events: none;
`

const Saucer = styled.div<{ $image: string }>`
  position: absolute;
  left: 50%;
  bottom: -6%;
  height: clamp(19.8rem, 26.4vw, 30.8rem);
  aspect-ratio: 528 / 698;
  background: ${({ $image }) => `url(${$image}) no-repeat center / contain`};
  animation: ${saucerFlight} ${ANIMATION_DURATION} linear infinite both;
  transform-origin: center;
  z-index: 4;

  /* ${Media.upToMedium()} {
    bottom: -18%;
    height: min(26rem, 60vw);
  } */
`

const Cow = styled.div<{ $image: string }>`
  position: absolute;
  left: 50%;
  bottom: 0;
  width: clamp(8.8rem, 14.4vw, 14.4rem);
  aspect-ratio: 122 / 75;
  background: ${({ $image }) => `url(${$image}) no-repeat bottom / contain`};
  animation: ${cowAbduction} ${ANIMATION_DURATION} linear infinite both;
  transform-origin: center;
  z-index: 3;

  ${Media.upToMedium()} {
    width: clamp(6.6rem, 10.8vw, 10.8rem);
  }

  ${Media.upToSmall()} {
    width: clamp(4.4rem, 7.2vw, 7.2rem);
  }
`

export function CowSaucerScene({ darkMode }: CowSaucerSceneProps): ReactNode {
  const assets = useMemo(
    () => ({
      saucer: darkMode ? saucerDarkIMG : saucerLightIMG,
      cow: darkMode ? cowDarkIMG : cowLightIMG,
    }),
    [darkMode],
  )

  return (
    <SceneCanvas aria-hidden>
      <Cow $image={assets.cow} />
      <Saucer $image={assets.saucer} />
    </SceneCanvas>
  )
}
