import { UI } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

export const ProtocolIcon = styled.div<{ bgColor?: string; size?: number }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => (size ? `${size}px` : 'var(--size)')};
  height: ${({ size }) => (size ? `${size}px` : 'var(--size)')};
  border-radius: ${({ size }) => (size ? `${size}px` : 'var(--size)')};
  overflow: hidden;
  background: ${({ bgColor }) => (bgColor ? `var(${bgColor})` : 'transparent')};
  z-index: 2;
  border: 2px solid var(${UI.COLOR_PAPER});
  box-sizing: content-box;
  transition: transform 0.3s ease-in-out;

  > svg,
  > span,
  > img {
    object-fit: contain;
    width: 100%;
    height: 100%;
    padding: ${({ bgColor }) => (bgColor ? '3px' : '0')};
    transition: transform 0.3s ease-in-out;
  }

  &:hover {
    > svg,
    > span,
    > img {
      animation: ${spin} 10s linear infinite;
    }
  }
`

export const ProtocolIconsContainer = styled.div<{ iconSize?: number }>`
  --size: ${({ iconSize }) => (iconSize ? `${iconSize}px` : '18px')};
  display: inline-flex;
  align-items: center;

  // Negative margin to the left of the next icon
  > ${ProtocolIcon}:not(:first-child) {
    margin-left: calc(var(--size) * -0.6);
    z-index: 1;
  }

  > ${ProtocolIcon}:hover {
    z-index: 3;
  }
`
