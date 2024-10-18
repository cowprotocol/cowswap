import styled, { css } from 'styled-components/macro'

import { UI } from '../../enum'

export const LoadingRows = styled.div`
  display: grid;

  & > div {
    animation: loadingAnimation 1.5s infinite;
    animation-fill-mode: both;
    background: linear-gradient(
      to left,
      var(${UI.COLOR_PAPER}) 25%,
      var(${UI.COLOR_PAPER_DARKER}) 50%,
      var(${UI.COLOR_PAPER}) 75%
    );
    background-size: 400%;
    border-radius: 12px;
    height: 2.4em;
    will-change: background-position;
  }

  @keyframes loadingAnimation {
    0% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
`

export const LoadingRowSmall = styled.div`
  width: 24px;
  height: 10px !important;
`

export const loadingOpacityMixin = css<{ $loading: boolean }>`
  filter: ${({ $loading }) => ($loading ? 'grayscale(1)' : 'none')};
  opacity: ${({ $loading }) => ($loading ? '0.4' : '1')};
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
`
