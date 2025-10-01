'use client'

import { ReactNode } from 'react'

import BG_IMAGE_MED from '@cowprotocol/assets/images/404/cowfi/bg-med.svg'
import BG_IMAGE_SMALL from '@cowprotocol/assets/images/404/cowfi/bg-small.svg'
import BG_IMAGE from '@cowprotocol/assets/images/404/cowfi/bg.svg'
import COW_IMAGE from '@cowprotocol/assets/images/404/cowfi/cow.svg'
import SAUCER_IMAGE from '@cowprotocol/assets/images/404/cowfi/saucer.svg'
import { Media } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

const ANIMATION_DURATION = '10s'

const SAUCER_OFFSET = {
  entry: '60vw',
  center: '0',
  exit: '-60vw',
}

const SAUCER_ROTATION = {
  entry: '-4deg',
  center: '0deg',
  exit: '6deg',
}

const SAUCER_BOTTOM = {
  desktop: '-2%',
  mobile: '-24%',
}

const COW_POSITION = {
  baseX: '-50%',
  groundY: '0',
  liftY: '-40%',
}

const COW_MAX_WIDTH = '10rem'
const FOOTER_OVERLAP = '0rem'

const SAUCER_HEIGHT = {
  min: '18rem',
  preferred: '22vw',
  max: '28rem',
  mobile: {
    preferred: '56vw',
    max: '26rem',
  },
}

const saucerTransform = (offset: string, rotation: string): string =>
  `translate(${COW_POSITION.baseX}, 0) translateX(${offset}) rotate(${rotation})`

const cowTransform = (x: string, y: string, scale = '1'): string => `translate(${x}, ${y}) scale(${scale})`

const cowSaucerOffset = (offset: string): string => `calc(${COW_POSITION.baseX} + ${offset})`

const saucerFlight = keyframes`
  0%,
  100% {
    transform: ${saucerTransform(SAUCER_OFFSET.entry, SAUCER_ROTATION.entry)};
    opacity: 0;
  }

  20%,
  45% {
    transform: ${saucerTransform(SAUCER_OFFSET.center, SAUCER_ROTATION.center)};
    opacity: 1;
  }

  70% {
    transform: ${saucerTransform(SAUCER_OFFSET.exit, SAUCER_ROTATION.exit)};
    opacity: 0;
  }
`

const cowAbduction = keyframes`
  0%,
  18% {
    opacity: 1;
    transform: ${cowTransform(COW_POSITION.baseX, COW_POSITION.groundY)};
  }

  25%,
  45% {
    opacity: 1;
    transform: ${cowTransform(COW_POSITION.baseX, COW_POSITION.liftY, '1.04')};
  }

  70%,
  75% {
    transform: ${cowTransform(cowSaucerOffset(SAUCER_OFFSET.exit), COW_POSITION.liftY, '1.02')};
  }

  70% {
    opacity: 0.85;
  }

  75% {
    opacity: 0;
  }

  85% {
    opacity: 0;
    transform: ${cowTransform(cowSaucerOffset(SAUCER_OFFSET.entry), COW_POSITION.liftY, '1.02')};
  }

  92% {
    opacity: 1;
    transform: ${cowTransform(COW_POSITION.baseX, COW_POSITION.liftY, '1.02')};
  }

  100% {
    opacity: 1;
    transform: ${cowTransform(COW_POSITION.baseX, COW_POSITION.groundY)};
  }
`

const SceneSection = styled.section`
  position: relative;
  width: 100%;
  margin: 0 0 calc(${FOOTER_OVERLAP} * -1);
  padding-bottom: ${FOOTER_OVERLAP};
  background: url(${BG_IMAGE}) left bottom / 100% auto no-repeat;
  overflow: hidden;

  ${Media.upToMedium()} {
    margin-top: -10rem;
    background-image: url(${BG_IMAGE_MED});
  }

  ${Media.upToSmall()} {
    background-image: url(${BG_IMAGE_SMALL});
  }
`

const SceneCanvas = styled.div`
  position: relative;
  width: min(172.4rem, 100vw);
  margin: 0 auto;
  height: clamp(26rem, 36vw, 32rem);
  pointer-events: none;
`

const Saucer = styled.div`
  position: absolute;
  left: 50%;
  bottom: ${SAUCER_BOTTOM.desktop};
  height: clamp(${SAUCER_HEIGHT.min}, ${SAUCER_HEIGHT.preferred}, ${SAUCER_HEIGHT.max});
  width: auto;
  aspect-ratio: 528 / 698;
  background: url(${SAUCER_IMAGE}) no-repeat center / contain;
  animation: ${saucerFlight} ${ANIMATION_DURATION} linear infinite both;
  transform-origin: center;
  pointer-events: none;
  z-index: 4;

  ${Media.upToMedium()} {
    height: min(${SAUCER_HEIGHT.mobile.max}, ${SAUCER_HEIGHT.mobile.preferred});
    bottom: ${SAUCER_BOTTOM.mobile};
  }
`

const Cow = styled.div`
  position: absolute;
  left: 50%;
  bottom: 0;
  width: clamp(12rem, 20vw, ${COW_MAX_WIDTH});
  aspect-ratio: 116 / 85;
  background: url(${COW_IMAGE}) no-repeat bottom / contain;
  animation: ${cowAbduction} ${ANIMATION_DURATION} linear infinite both;
  transform-origin: center;
  pointer-events: none;
  z-index: 3;
`

export function CowSaucerScene(): ReactNode {
  return (
    <SceneSection aria-hidden>
      <SceneCanvas>
        <Cow />
        <Saucer />
      </SceneCanvas>
    </SceneSection>
  )
}
