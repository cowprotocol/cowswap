import { css } from 'styled-components/macro'

export const loadingAnimationMixin = css`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  padding: 0;
  border: transparent;
  transform: translateX(-100%) rotateY(-180deg);

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: -2px;
    top: -2px;
    background: linear-gradient(45deg, #e57751, #c5daef, #275194, ${({ theme }) => theme.bg4}, #c5daef, #1b5a7a);
    background-size: 800%;
    width: calc(100% + 4px);
    height: calc(100% + 4px);
    z-index: -1;
    animation: steam 7s linear infinite;
    border-radius: 11px;
  }

  &::after {
    filter: blur(10px);
  }

  @keyframes steam {
    0% {
      background-position: 0 0;
    }
    50% {
      background-position: 400% 0;
    }
    100% {
      background-position: 0 0;
    }
  }
`
