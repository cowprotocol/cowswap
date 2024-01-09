import styled, { keyframes } from 'styled-components'

import { media } from 'theme/styles/media'
import GraphSkeleton from 'assets/img/graph-skeleton.svg'
import ShimmerBar from 'apps/explorer/components/common/ShimmerBar'

const frameAnimation = keyframes`
    100% {
      mask-position: left;
    }
`
export const ChartSkeleton = styled.div<{ backgroundColor?: 'grey' | 'orange' }>`
  height: 100%;
  min-height: 21.6rem;
  border: 1px solid ${({ theme }): string => theme.borderPrimary};
  border-radius: 0.4rem;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-content: center;
  background: url(${GraphSkeleton}) no-repeat bottom/contain
    ${({ theme, backgroundColor = 'grey' }): string =>
      backgroundColor === 'grey' ? theme.greyOpacity : theme.orangeOpacity};
  opacity: 0.35;

  h2 {
    margin: 3rem 0;
  }

  /* shimmering */
  mask: linear-gradient(-60deg, #000 30%, #0005, #000 70%) right/300% 100%;
  background-repeat: no-repeat;
  animation: shimmer 1.5s infinite;
  animation-name: ${frameAnimation};
`

export const WrapperChart = styled.div`
  position: relative;

  .time-selector {
    position: absolute;
    top: 1rem;
    right: 1rem;
    list-style-type: none;
    margin: 0;
    padding: 0;
    overflow: hidden;
    font-size: small;
    color: ${({ theme }): string => theme.grey};
    z-index: 3;
  }

  > div.floating-tooltip {
    width: 9.6rem;
    height: 40%;
    position: absolute;
    display: none;
    box-sizing: border-box;
    font-size: 12px;
    color: '#20262E';
    background-color: rgba(255, 255, 255, 0.23);
    text-align: center;
    z-index: 1;
    top: 0;
    left: 1.2rem;
    pointer-events: none;
    border-bottom: none;
    border-radius: 0.2rem;
    box-shadow: 0 0.2rem 0.5rem 0 rgba(117, 134, 150, 0.45);
    flex-direction: column;
    gap: 1rem;
    justify-content: end;
  }

  canvas {
    top: 3rem !important;
    height: calc(100% - 3rem) !important;
  }
  ${media.mobile} {
    canvas {
      top: 5rem !important;
      height: calc(100% - 5rem) !important;
    }
  }
`

export const ContainerTitle = styled.span<{ captionColor?: 'green' | 'red1' | 'grey' }>`
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 3;
  > h3 {
    color: ${({ theme }): string => theme.grey};
    font-size: small;
    font-weight: ${({ theme }): string => theme.fontMedium};
    margin: 0;
    ${media.mobile} {
      top: 0.5rem;
      word-wrap: break-word;
      max-width: 13rem;
      line-height: 1.1;
      font-size: x-small;
    }
  }

  > span {
    display: flex;
    margin: 0;
    padding: 0;
    gap: 1rem;
    align-items: center;

    > p {
      color: ${({ theme }): string => theme.white};
      font-size: large;
      font-weight: ${({ theme }): string => theme.fontBold};
      &.caption {
        font-size: 1.1rem;
        color: ${({ theme, captionColor }): string => (captionColor ? theme[captionColor] : theme.grey)};
      }
      &.date {
        margin: -1rem 0;
        color: ${({ theme }): string => theme.grey};
        font-size: 1.1rem;
      }
      ${media.mobile} {
        font-size: small;
      }
    }
  }
`
export const WrapperPeriodButton = styled.button<{ active: boolean }>`
  outline: inherit;
  cursor: pointer;
  float: left;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, active }): string => (active ? theme.orange : theme.white)};
  background-color: ${({ theme, active }): string => (active ? theme.orangeOpacity : theme.bg1)};
  border: 1px solid ${({ theme, active }): string => (active ? theme.orange : theme.bg2)};
  padding: 0;
  border-radius: 0.6rem;
  margin: 0 0.5rem;
  height: 2.5rem;
  width: 3.8rem;

  ${media.mobile} {
    padding: 0;
    margin: 0 0.5rem;
    font-size: 1.2rem;
    width: 3rem;
  }

  &:hover {
    color: ${({ theme }): string => theme.orange};
    background-color: ${({ theme, active }): string => (active ? theme.bg1 : theme.orangeOpacity)};
  }
`
export const StyledShimmerBar = styled(ShimmerBar)`
  margin: 1.2rem 0;
  min-width: 10rem;
`

export const WrapperTooltipPrice = styled.div<{ left: number; top: number; height?: number; width?: number }>`
  color: ${({ theme }): string => theme.white};
  background-color: ${({ theme }): string => theme.bg1};
  border: 1px solid ${({ theme }): string => theme.bg2};
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  margin: 0;
  z-index: 2;
  position: absolute;
  left: ${({ left }): string => `${left}px`};
  top: ${({ top }): string => `${top}px`};
  height: ${({ height = 64 }): string => `${height}px`};
  width: ${({ width = 140 }): string => `${width}px`};

  > h4 {
    font-size: 1.5rem;
    font-weight: ${({ theme }): string => theme.fontMedium};
    margin: 1rem 0;
    color: ${({ theme }): string => theme.white};
  }

  > p {
    color: ${({ theme }): string => theme.grey};
    font-size: 1.1rem;
    padding: 0;
  }
`
