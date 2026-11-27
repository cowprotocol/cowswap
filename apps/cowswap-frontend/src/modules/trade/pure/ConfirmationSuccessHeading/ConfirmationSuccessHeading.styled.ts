import { font, transitions, UI } from '@cowprotocol/ui'

import styled, { css, keyframes } from 'styled-components/macro'

const reducedMotion = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    filter: none;
  }
`

const gradientIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-24px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0); 
  }
`

const checkReveal = keyframes`
  from {
    opacity: 0;
    transform: scale(2);
  }
  50% {
    transform: scale(1);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`

export const Wrapper = styled.div`
  --confirmation-success-duration: ${transitions.duration.slow};

  position: relative;
  width: 100%;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: linear-gradient(
      to bottom,
      var(${UI.COLOR_SUCCESS_BG}) 0%,
      var(${UI.COLOR_SUCCESS_BG}) 18%,
      transparent 100%
    );
  }
`

export const Content = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 24px 44px;
  text-align: center;
  animation: ${gradientIn} var(--confirmation-success-duration) ${transitions.timing.out} both;
  ${reducedMotion}
`

export const IconCircle = styled.div`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(${UI.COLOR_SUCCESS_BG});
  color: var(${UI.COLOR_SUCCESS_TEXT});
  animation: ${checkReveal} var(--confirmation-success-duration) ${transitions.timing.out} both;
  ${reducedMotion}
`

export const CheckIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;

  > svg {
    width: 22px;
    height: 22px;
  }
`

export const Title = styled.h2`
  ${font('FONT_LARGER', 'semibold')}
  margin: 0;
  color: var(${UI.COLOR_SUCCESS_TEXT});
`

export const Subtitle = styled.p`
  ${font('FONT_SMALL_PLUS', 'regular')}
  margin: 0;
  color: var(${UI.COLOR_SUCCESS_TEXT});

  a {
    color: inherit;
    white-space: nowrap;
  }
`
