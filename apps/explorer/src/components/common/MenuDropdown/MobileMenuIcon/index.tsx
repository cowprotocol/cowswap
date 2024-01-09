import React from 'react'
import styled, { css, FlattenSimpleInterpolation } from 'styled-components'
import { media } from 'theme/styles/media'

const Wrapper = styled.div<{ isMobileMenuOpen: boolean }>`
  z-index: 102;
  display: flex;
  cursor: pointer;
  margin: 0 0.6rem 0 1.6rem;
  position: relative;
  width: 3.4rem;
  height: 1.8rem;
  ${media.mobile} {
    width: 2.8rem;
  }

  span {
    background-color: ${({ theme }): string => theme.textSecondary1};
    border-radius: 0.3rem;
    height: 0.2rem;
    position: absolute;
    transition: all 0.15s cubic-bezier(0.8, 0.5, 0.2, 1.4);
    width: 100%;
    margin: auto;
  }

  span:nth-child(1) {
    left: 0;
    top: 0;
    ${({ isMobileMenuOpen }): FlattenSimpleInterpolation | null =>
      isMobileMenuOpen
        ? css`
            transform: rotate(45deg);
            top: 50%;
            bottom: 50%;
          `
        : null}
  }

  span:nth-child(2) {
    left: 0;
    opacity: 1;
    top: 50%;
    bottom: 50%;
    ${({ isMobileMenuOpen }): FlattenSimpleInterpolation | null =>
      isMobileMenuOpen
        ? css`
            opacity: 0;
          `
        : null}
  }

  span:nth-child(3) {
    bottom: 0;
    left: 0;
    width: 75%;
    ${({ isMobileMenuOpen }): FlattenSimpleInterpolation | null =>
      isMobileMenuOpen
        ? css`
            transform: rotate(-45deg);
            top: 50%;
            bottom: 50%;
            width: 100%;
          `
        : null}
  }
`
interface IconProps {
  isMobileMenuOpen: boolean
  onClick?: () => void
}

export default function MobileMenuIcon(params: IconProps): JSX.Element {
  return (
    <Wrapper {...params}>
      <span></span>
      <span></span>
      <span></span>
    </Wrapper>
  )
}
