import { transitions, UI } from '@cowprotocol/ui'

import styled, { css, keyframes } from 'styled-components/macro'

const placeholderHeight = 'var(--progress-top-section-height, 230px)'

const reducedMotion = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    transition: none;
    opacity: 1;
    filter: none;
  }
`

const shimmer = keyframes`
  from {
    background-position: 100% 0;
  }
  to {
    background-position: -100% 0;
  }
`

const contentIn = keyframes`
  from {
    opacity: 0;
    filter: blur(4px);
  }
  to {
    opacity: 1;
    filter: blur(0);
  }
`

export const Frame = styled.div<{ $reserveHeight: boolean }>`
  width: 100%;

  ${({ $reserveHeight }) =>
    $reserveHeight &&
    css`
      min-height: ${placeholderHeight};
    `}
`

export const LoadingBox = styled.div`
  width: 100%;
  height: ${placeholderHeight};
  min-height: ${placeholderHeight};
  border-radius: 21px;
  background-color: color-mix(in srgb, var(${UI.COLOR_PAPER_DARKER}) 48%, transparent);
  background-image: linear-gradient(
    105deg,
    transparent 28%,
    color-mix(in srgb, var(${UI.COLOR_TEXT}) 12%, transparent) 50%,
    transparent 72%
  );
  background-size: 220% 100%;
  animation: ${shimmer} 2.8s ease-in-out infinite;
  ${reducedMotion}
`

export const Reveal = styled.div<{ $settled: boolean }>`
  width: 100%;

  ${({ $settled }) =>
    !$settled &&
    css`
      height: ${placeholderHeight};
      overflow: hidden;
      border-radius: 21px;
      transition: height ${transitions.duration.slow} ${transitions.timing.out};
      ${reducedMotion}
    `}
`

export const Content = styled.div`
  width: 100%;
  animation: ${contentIn} ${transitions.duration.slow} ${transitions.timing.out} both;
  ${reducedMotion}
`
