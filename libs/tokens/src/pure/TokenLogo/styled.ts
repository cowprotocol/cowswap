import { Media, UI } from '@cowprotocol/ui'

import styled, { css } from 'styled-components/macro'

const DEFAULT_SIZE = 42
const DEFAULT_CHAIN_LOGO_SIZE = 16

export const TokenLogoWrapper = styled.div<{ size?: number; sizeMobile?: number }>`
  --size: ${({ size = DEFAULT_SIZE }) => size}px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border-radius: var(--size);
  width: var(--size);
  height: var(--size);
  min-width: var(--size);
  min-height: var(--size);
  font-size: var(--size);
  overflow: visible;

  > img,
  > svg {
    width: 100%;
    height: 100%;
    border-radius: var(--size);
    object-fit: contain;
  }

  ${Media.upToSmall()} {
    ${({ sizeMobile }) =>
      sizeMobile
        ? css`
            --sizeMobile: ${sizeMobile}px;
            border-radius: var(--sizeMobile);
            width: var(--sizeMobile);
            height: var(--sizeMobile);
            min-width: var(--sizeMobile);
            min-height: var(--sizeMobile);
            font-size: var(--sizeMobile);

            > img,
            > svg {
              border-radius: var(--sizeMobile);
            }
          `
        : ''}
  }
`

interface ClippedTokenContentWrapperProps {
  parentSize: number
  chainLogoSize: number
  cutThickness: number
  hasImage: boolean
}

export const ClippedTokenContentWrapper = styled.div<ClippedTokenContentWrapperProps>`
  --parent-size: ${({ parentSize = DEFAULT_SIZE }) => parentSize}px;
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background: ${({ hasImage }) => (hasImage ? 'transparent' : `var(${UI.COLOR_DARK_IMAGE_PAPER})`)};
  color: ${({ hasImage }) => (hasImage ? 'inherit' : `var(${UI.COLOR_DARK_IMAGE_PAPER_TEXT})`)};
  border-radius: var(--parent-size);
  transform: translateZ(0);

  > img,
  > svg,
  > div {
    width: 100%;
    height: 100%;
    border-radius: var(--parent-size);
    object-fit: contain;
    background: var(${UI.COLOR_DARK_IMAGE_PAPER});
  }

  ${({ parentSize, chainLogoSize, cutThickness }) => {
    const chainLogoRadius = chainLogoSize / 2
    const chainLogoCenterX = parentSize - chainLogoRadius
    const chainLogoCenterY = parentSize - chainLogoRadius

    const innerTransparentRadius = chainLogoRadius
    const outerTransparentRadius = chainLogoRadius + cutThickness

    return css`
      mask-image: radial-gradient(
        circle at ${chainLogoCenterX}px ${chainLogoCenterY}px,
        white 0%,
        white ${innerTransparentRadius}px,
        transparent ${innerTransparentRadius}px,
        transparent ${outerTransparentRadius}px,
        white ${outerTransparentRadius}px,
        white 100%
      );
    `
  }}
`

export const ChainLogoWrapper = styled.div<{ size?: number }>`
  --size: ${({ size = DEFAULT_CHAIN_LOGO_SIZE }) => size}px;
  position: absolute;
  bottom: 0;
  right: 0;
  width: var(--size);
  height: var(--size);
  border-radius: var(--size);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;

  > img,
  > svg {
    width: 100%;
    height: 100%;
    border-radius: var(--size);
    object-fit: contain;
    background: var(${UI.COLOR_DARK_IMAGE_PAPER});
  }
`

export const LpTokenWrapper = styled.div<{ size?: number }>`
  --size: ${({ size = DEFAULT_SIZE }) => size}px;
  width: 100%;
  height: 100%;
  position: relative;

  > div {
    width: 50%;
    height: 100%;
    overflow: hidden;
    position: absolute;
  }

  > div:last-child {
    right: -1px;
  }

  > div:last-child > img,
  > div:last-child > svg {
    right: 100%;
    position: relative;
  }

  > div > img,
  > div > svg {
    width: var(--size);
    height: var(--size);
    min-width: var(--size);
    min-height: var(--size);
    background: var(${UI.COLOR_DARK_IMAGE_PAPER});
  }
`
