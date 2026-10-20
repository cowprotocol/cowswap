import { font, transitions, UI } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`

const checkReveal = keyframes`
  from {
    opacity: 0;
    filter: blur(4px);
    transform: scale(2);
  }
  50% {
    transform: scale(1);
  }
  to {
    opacity: 1;
    filter: blur(0);
    transform: scale(1);
  }
`

export const Wrapper = styled.div`
  --confirmation-success-duration: ${transitions.duration.slow};

  width: 100%;
  background: linear-gradient(
    to bottom,
    var(${UI.COLOR_SUCCESS_BG}) 0%,
    var(${UI.COLOR_SUCCESS_BG}) 18%,
    transparent 100%
  );
`

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 24px 44px;
  text-align: center;
  animation: ${fadeIn} var(--confirmation-success-duration) ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
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
  animation: ${checkReveal} var(--confirmation-success-duration) ease-out both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    opacity: 1;
    filter: none;
    transform: none;
  }
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
`
