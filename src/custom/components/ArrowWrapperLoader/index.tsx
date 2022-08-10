import { useMemo } from 'react'
import styled from 'styled-components/macro'
import loadingCowWebp from 'assets/cow-swap/cow-load.webp'
import { ArrowDown } from 'react-feather'
import useLoadingWithTimeout from 'hooks/useLoadingWithTimeout'
import { useIsQuoteRefreshing, useIsBestQuoteLoading } from 'state/price/hooks'
import { LONG_LOAD_THRESHOLD, SHORT_LOAD_THRESHOLD } from 'constants/index'

interface ShowLoaderProp {
  showloader: boolean
}

const ArrowDownIcon = styled(ArrowDown)`
  stroke: ${({ theme }) => theme.swap.arrowDown.color};
  backface-visibility: hidden;
  width: 100%;
  height: 100%;
  object-fit: contain;
  padding: 4px;
  margin: 0;
  position: absolute;
`

export const Wrapper = styled.div<ShowLoaderProp>`
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
    ${ArrowDownIcon} {
      stroke: ${({ theme }) => theme.swap.arrowDown.colorHover};
    }
  }

  ${({ showloader }) =>
    showloader &&
    `
    > ${ArrowDownIcon} {
      height: 0;
      width: 0;
    }
  `}

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

  ${({ showloader, theme }) =>
    showloader &&
    `
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
        background: linear-gradient(45deg, #e57751, #c5daef, #275194, ${theme.bg4}, #c5daef, #1b5a7a);
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
    `}
`

export interface ArrowWrapperLoaderProps {
  onSwitchTokens: () => void
  setApprovalSubmitted: React.Dispatch<React.SetStateAction<boolean>>
}

export function ArrowWrapperLoader({ onSwitchTokens, setApprovalSubmitted }: ArrowWrapperLoaderProps) {
  const isRefreshingQuote = useIsQuoteRefreshing()
  const isBestQuoteLoading = useIsBestQuoteLoading()

  const showCowLoader = useLoadingWithTimeout(isRefreshingQuote, LONG_LOAD_THRESHOLD)
  const showQuoteLoader = useLoadingWithTimeout(isBestQuoteLoading, SHORT_LOAD_THRESHOLD)

  const handleClick = () => {
    setApprovalSubmitted(false) // reset 2 step UI for approvals
    onSwitchTokens()
  }

  const showLoader = useMemo(
    () => Boolean(loadingCowWebp) && (showCowLoader || showQuoteLoader),
    [showCowLoader, showQuoteLoader]
  )

  return (
    <Wrapper showloader={showLoader} onClick={handleClick}>
      <ArrowDownIcon />
      {showLoader && (
        <div>
          <img src={loadingCowWebp} alt="Loading prices..." />
        </div>
      )}
    </Wrapper>
  )
}
