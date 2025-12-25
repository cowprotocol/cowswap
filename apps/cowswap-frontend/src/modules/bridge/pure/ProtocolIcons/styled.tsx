import styled, { keyframes, css } from 'styled-components/macro'

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

interface ProtocolIconProps {
  bgColor?: string
  color?: string
  size?: number
  isStacked?: boolean
  maskConfig?: {
    cx: number // x-coordinate of the center of the overlapping (top) icon
    cy: number // y-coordinate of the center of the overlapping (top) icon
    innerR: number // radius of the overlapping (top) icon
    outerR: number // innerR + cutThickness, defines the transparent ring
  }
}

export const ProtocolIcon = styled.div<ProtocolIconProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => (size ? `${size}px` : 'var(--size)')};
  height: ${({ size }) => (size ? `${size}px` : 'var(--size)')};
  border-radius: ${({ size }) => (size ? `${size}px` : 'var(--size)')};
  overflow: hidden; // Important if children are slightly larger or for clean rounded corners
  background: ${({ bgColor }) => (bgColor ? `var(${bgColor})` : 'transparent')};
  color: ${({ color }) => color || 'currentColor'};
  position: relative;
  transition: transform 0.3s ease-in-out;

  ${({ maskConfig }) =>
    maskConfig &&
    css`
      mask-image: radial-gradient(
        circle at ${maskConfig.cx}px ${maskConfig.cy}px,
        white 0%,
        white ${maskConfig.innerR}px,
        /* Bottom icon visible under top icon */ transparent ${maskConfig.innerR}px,
        /* Start of transparent ring (cutout border) */ transparent ${maskConfig.outerR}px,
        /* End of transparent ring */ white ${maskConfig.outerR}px,
        /* Rest of bottom icon visible */ white 100%
      );
    `}

  &:hover {
    animation: ${spin} 10s linear infinite;
  }

  > img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

export const ProtocolIconsContainer = styled.div<{ iconSize?: number; overlapRatio: number }>`
  --size: ${({ iconSize }) => (iconSize ? `${iconSize}px` : '18px')};
  display: inline-flex;
  align-items: center;
  position: relative;

  > ${ProtocolIcon}:nth-child(2) {
    margin-left: calc(var(--size) * -${({ overlapRatio }) => overlapRatio});
  }
`
