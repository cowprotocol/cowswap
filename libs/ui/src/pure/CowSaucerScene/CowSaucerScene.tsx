import { ReactNode } from 'react'

import styled, { keyframes } from 'styled-components/macro'

import { Media } from '../../consts'

const ANIMATION_DURATION = '10s'

const SAUCER_HORIZONTAL = {
  entry: '55vw',
  center: '0',
  exit: '-55vw',
}

const SAUCER_ROTATION = {
  entry: '0',
  center: '0',
  exit: '0',
}

const COW_VERTICAL = {
  ground: '0',
  mid: '-18%',
  lifted: '-38%',
}

const saucerKeyframe = (offset: string, rotation: string): string =>
  `translate(-50%, 0) translateX(${offset}) rotate(${rotation})`

const cowMoveKeyframe = (offset: string, y: string): string => `translate(-50%, ${y}) translateX(${offset})`

const saucerFlight = keyframes`
  0%,
  16% {
    transform: ${saucerKeyframe(SAUCER_HORIZONTAL.entry, SAUCER_ROTATION.entry)};
    opacity: 0;
  }

  26%,
  44% {
    transform: ${saucerKeyframe(SAUCER_HORIZONTAL.center, SAUCER_ROTATION.center)};
    opacity: 1;
  }

  56% {
    transform: ${saucerKeyframe(SAUCER_HORIZONTAL.exit, SAUCER_ROTATION.exit)};
    opacity: 1;
  }

  64% {
    transform: ${saucerKeyframe(SAUCER_HORIZONTAL.exit, SAUCER_ROTATION.exit)};
    opacity: 0;
  }

  72%,
  100% {
    transform: ${saucerKeyframe(SAUCER_HORIZONTAL.entry, SAUCER_ROTATION.entry)};
    opacity: 0;
  }
`

const cowAbduction = keyframes`
  0%,
  22% {
    opacity: 1;
    transform: ${cowMoveKeyframe('0', COW_VERTICAL.ground)};
  }

  28% {
    opacity: 1;
    transform: ${cowMoveKeyframe(SAUCER_HORIZONTAL.center, COW_VERTICAL.ground)};
  }

  36% {
    opacity: 1;
    transform: ${cowMoveKeyframe(SAUCER_HORIZONTAL.center, COW_VERTICAL.mid)};
  }

  44% {
    opacity: 1;
    transform: ${cowMoveKeyframe(SAUCER_HORIZONTAL.center, COW_VERTICAL.lifted)};
  }

  56% {
    opacity: 1;
    transform: ${cowMoveKeyframe(SAUCER_HORIZONTAL.exit, COW_VERTICAL.lifted)};
  }

  60%,
  74% {
    opacity: 0;
    transform: ${cowMoveKeyframe(SAUCER_HORIZONTAL.exit, COW_VERTICAL.lifted)};
  }

  82% {
    opacity: 0;
    transform: ${cowMoveKeyframe(SAUCER_HORIZONTAL.entry, COW_VERTICAL.ground)};
  }

  88% {
    opacity: 0;
    transform: ${cowMoveKeyframe('0', COW_VERTICAL.ground)};
  }

  92%,
  100% {
    opacity: 1;
    transform: ${cowMoveKeyframe('0', COW_VERTICAL.ground)};
  }
`

const cowShrink = keyframes`
  0%,
  28% {
    transform: scale(1);
  }

  36% {
    transform: scale(0.8);
  }

  44%,
  56% {
    transform: scale(0.3);
  }

  60%,
  74% {
    transform: scale(0.3);
  }

  88% {
    transform: scale(0.8);
  }

  92%,
  100% {
    transform: scale(1);
  }
`

const beamPath = 'm292.634 77.996-51.082 15.716L209 697.996h312z'
const sideLeftPath = 'm328.821 57.64-16.516-10.253a26.44 26.44 0 0 0-18.985-3.493l-32.616 6.332 3.861 19.888z'
const sideRightPath = 'm200.309 82.593 11.481-15.69a26.44 26.44 0 0 1 16.299-10.341l32.616-6.331 3.86 19.888z'
const domePath =
  'm200.308 82.595 16.516 10.254a26.44 26.44 0 0 0 18.985 3.493l32.615-6.331h.001l32.615-6.33a26.44 26.44 0 0 0 16.299-10.343L328.82 57.65l-64.256 12.473v-.001z'
const capPath =
  'M280.489 32.397c-3.936-10.972-15.287-17.431-26.729-15.21-11.443 2.221-19.553 12.458-19.097 24.105l.543 13.894 49.977-9.702z'
const starPaths = [
  'M516.245 551.241l2.755-6.245 2.755 6.245 6.245 2.755-6.245 2.755-2.755 6.245-2.755-6.245-6.245-2.755z',
  'M425.184 68.1795 431 54.996l5.816 13.1837 13.184 5.8163-13.184 5.8164-5.816 13.1836-5.816-13.1836-13.184-5.8164z',
  'M7.63265 477.629 11 469.996l3.3673 7.633 7.6327 3.367-7.6327 3.367-3.3673 7.633-3.36735-7.633-7.63265-3.367z',
]

export interface SaucerPalette {
  beam: string
  beamOpacity: number
  side: string
  dome: string
  cap: string
  stars: string
}

export interface CowSaucerSceneProps {
  darkMode?: boolean
  cowSprites: {
    light: string
    dark?: string
  }
  palettes: {
    light: SaucerPalette
    dark?: SaucerPalette
  }
  className?: string
}

function SaucerSvg({ palette }: { palette: SaucerPalette }): ReactNode {
  return (
    <StyledSaucerSvg viewBox="0 0 528 698" role="presentation">
      <path d={beamPath} fill={palette.beam} fillOpacity={palette.beamOpacity} />
      <path d={sideLeftPath} fill={palette.side} />
      <path d={sideRightPath} fill={palette.side} />
      <path d={domePath} fill={palette.dome} />
      <path d={capPath} fill={palette.cap} />
      {starPaths.map((path, index) => (
        <path key={path} className={`star star--${index + 1}`} d={path} fill={palette.stars} />
      ))}
    </StyledSaucerSvg>
  )
}

export function CowSaucerScene({ darkMode = false, palettes, cowSprites, className }: CowSaucerSceneProps): ReactNode {
  const cowAsset = darkMode && cowSprites.dark ? cowSprites.dark : cowSprites.light
  const palette = darkMode && palettes.dark ? palettes.dark : palettes.light

  return (
    <SceneCanvas className={className} aria-hidden>
      <Cow>
        <CowSprite $image={cowAsset} />
      </Cow>
      <SaucerWrapper>
        <SaucerSvg palette={palette} />
      </SaucerWrapper>
    </SceneCanvas>
  )
}

const SceneCanvas = styled.div`
  position: relative;
  width: min(120rem, 100vw);
  height: clamp(24rem, 32vw, 30rem);
  pointer-events: none;
`

const SaucerWrapper = styled.div`
  position: absolute;
  left: 50%;
  bottom: -6%;
  height: clamp(19.8rem, 26.4vw, 30.8rem);
  aspect-ratio: 528 / 698;
  animation: ${saucerFlight} ${ANIMATION_DURATION} linear infinite both;
  transform-origin: center;
  z-index: 4;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: translate(-50%, 0);
  }
`

const Cow = styled.div`
  position: absolute;
  left: calc(50% + 30px);
  bottom: 0;
  width: clamp(8.8rem, 14.4vw, 14.4rem);
  aspect-ratio: 122 / 75;
  animation: ${cowAbduction} ${ANIMATION_DURATION} linear infinite both;
  transform-origin: center;
  z-index: 3;

  ${Media.upToMedium()} {
    width: clamp(6.6rem, 10.8vw, 10.8rem);
  }

  ${Media.upToSmall()} {
    width: clamp(4.4rem, 7.2vw, 7.2rem);
  }

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: translate(-50%, 0);
  }
`

const CowSprite = styled.div<{ $image: string }>`
  width: 100%;
  height: 100%;
  background: ${({ $image }) => `url(${$image}) no-repeat bottom / contain`};
  animation: ${cowShrink} ${ANIMATION_DURATION} linear infinite both;
  transform-origin: center;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transform: scale(1);
  }
`

const twinkle = keyframes`
  0%,
  100% {
    opacity: 0.3;
    transform: rotate(calc(var(--twinkle-rotation, 5deg) * var(--twinkle-direction, 1) * -1))
      scale(var(--twinkle-scale-min, 0.92));
  }

  35% {
    opacity: 0.75;
    transform: rotate(calc(var(--twinkle-rotation, 5deg) * var(--twinkle-direction, 1) * -0.2))
      scale(var(--twinkle-scale-mid, 1.02));
  }

  50% {
    opacity: 1;
    transform: rotate(calc(var(--twinkle-rotation, 5deg) * var(--twinkle-direction, 1)))
      scale(var(--twinkle-scale-max, 1.08));
  }

  70% {
    opacity: 0.6;
    transform: rotate(calc(var(--twinkle-rotation, 5deg) * var(--twinkle-direction, 1) * 0.25))
      scale(var(--twinkle-scale-mid, 1.02));
  }
`

const StyledSaucerSvg = styled.svg`
  width: 100%;
  height: 100%;
  display: block;

  .star {
    --twinkle-direction: 1;
    --twinkle-rotation: 5deg;
    --twinkle-scale-min: 0.92;
    --twinkle-scale-mid: 1.02;
    --twinkle-scale-max: 1.08;
    transform-origin: center;
    transform-box: fill-box;
    animation: ${twinkle} 2.4s ease-in-out infinite;
  }

  .star--2 {
    animation-delay: 0.8s;
    --twinkle-direction: -1;
    --twinkle-rotation: 7deg;
    --twinkle-scale-max: 1.12;
  }

  .star--3 {
    animation-delay: 1.6s;
    --twinkle-rotation: 4deg;
    --twinkle-scale-min: 0.9;
    --twinkle-scale-mid: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .star {
      animation: none;
    }
  }
`
