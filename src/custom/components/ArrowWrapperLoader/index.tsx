import React from 'react'
import styled, { css } from 'styled-components'
import loadingCowGif from 'assets/cow-swap/cow-load.gif'
import useLoadingWithTimeout from 'hooks/useLoadingWithTimeout'
import { useIsQuoteRefreshing } from 'state/price/hooks'
import { LONG_LOAD_THRESHOLD } from 'constants/index'

export interface ArrowWrapperProps {
  children: React.ReactNode
}

export function ArrowWrapperLoader({ children }: ArrowWrapperProps) {
  const isRefreshingQuote = useIsQuoteRefreshing()
  const showLoader = useLoadingWithTimeout(isRefreshingQuote, LONG_LOAD_THRESHOLD)

  return (
    <Wrapper showLoader={showLoader}>
      {children}
      {showLoader && (
        <div>
          <img src={loadingCowGif} alt="Loading prices..." />
        </div>
      )}
    </Wrapper>
  )
}

export const Wrapper = styled.div<{ showLoader: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.swap.arrowDown.background};
  width: ${({ theme }) => theme.swap.arrowDown.width};
  height: ${({ theme }) => theme.swap.arrowDown.height};
  border: ${({ theme }) => `${theme.swap.arrowDown.borderSize} solid ${theme.swap.arrowDown.borderColor}`};
  border-radius: ${({ theme }) => theme.swap.arrowDown.borderRadius};
  padding: 0;
  cursor: pointer;
  transform-style: preserve-3d;
  transform-origin: center right;
  transition: transform 0.25s;

  &:hover {
    > svg {
      stroke: ${({ theme }) => theme.swap.arrowDown.colorHover};
    }
  }

  > svg {
    stroke: ${({ theme }) => theme.swap.arrowDown.color};
    backface-visibility: hidden;
    width: 100%;
    height: 100%;
    object-fit: contain;
    padding: 4px;
    margin: 0;
    position: absolute;

    ${({ showLoader }) =>
      showLoader
        ? css`
            height: 0;
            width: 0;
          `
        : null}
  }

  > div {
    backface-visibility: hidden;
    transform: rotateY(180deg);
    background: ${({ theme }) => theme.swap.arrowDown.background};
    border-radius: ${({ theme }) => theme.swap.arrowDown.borderRadius};
    width: ${({ theme }) => theme.swap.arrowDown.width};
    height: ${({ theme }) => theme.swap.arrowDown.height};
  }

  > div > img {
    height: 100%;
    width: 100%;
    padding: 2px 2px 0;
    object-fit: contain;
    object-position: bottom;
  }

  ${({ showLoader }) =>
    showLoader
      ? css`
          position: absolute;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: visible;
          padding: 0;
          border: transparent;
          cursor: initial;
          transform: translateX(-100%) rotateY(-180deg);

          &::before,
          &::after {
            content: '';
            position: absolute;
            left: -2px;
            top: -2px;
            background: linear-gradient(
              45deg,
              #e57751,
              #c5daef,
              #275194,
              ${({ theme }) => theme.bg4},
              #c5daef,
              #1b5a7a
            );
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
      : null}
`
