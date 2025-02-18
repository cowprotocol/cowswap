import { Media, Color } from '@cowprotocol/ui'

import styled, { keyframes } from 'styled-components/macro'

import GraphSkeleton from '../../../../assets/img/graph-skeleton.svg'
import ShimmerBar from '../../common/ShimmerBar'

const frameAnimation = keyframes`
    100% {
      mask-position: left;
    }
`
export const ChartSkeleton = styled.div<{ backgroundColor?: 'grey' | 'orange' }>`
  height: 100%;
  min-height: 21.6rem;
  border: 1px solid ${Color.explorer_border};
  border-radius: 0.4rem;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-content: center;
  background: url(${GraphSkeleton}) no-repeat bottom/contain
    ${({ backgroundColor = 'grey' }): string =>
      backgroundColor === 'grey' ? Color.explorer_greyOpacity : Color.explorer_orangeOpacity};
  opacity: 0.35;

  h2 {
    margin: 3rem 0;
  }

  /* shimmering */
  mask: linear-gradient(-60deg, ${Color.neutral0} 30%, ${Color.explorer_bgOpaque}, ${Color.neutral0} 70%) right/300%
    100%;
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
    color: ${Color.explorer_grey};
    z-index: 3;
  }

  > div.floating-tooltip {
    width: 9.6rem;
    height: 40%;
    position: absolute;
    display: none;
    box-sizing: border-box;
    font-size: 12px;
    color: ${Color.explorer_textPrimary};
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
  ${Media.upToSmall()} {
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
    color: ${Color.explorer_grey};
    font-size: small;
    font-weight: ${({ theme }): string => theme.fontMedium};
    margin: 0;
    ${Media.upToSmall()} {
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
      color: ${Color.explorer_textPrimary};
      font-size: large;
      font-weight: ${({ theme }): string => theme.fontBold};
      &.caption {
        font-size: 1.1rem;
        color: ${({ captionColor }): string => {
          if (!captionColor) return Color.explorer_grey
          if (captionColor === 'green') return Color.explorer_green1
          if (captionColor === 'red1') return Color.explorer_red1
          return Color.explorer_grey
        }};
      }
      &.date {
        margin: -1rem 0;
        color: ${Color.explorer_grey};
        font-size: 1.1rem;
      }
      ${Media.upToSmall()} {
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
  color: ${({ active }): string => (active ? Color.explorer_orange1 : Color.explorer_textPrimary)};
  background-color: ${({ active }): string => (active ? Color.explorer_orangeOpacity : Color.explorer_bg2)};
  border: 1px solid ${({ active }): string => (active ? Color.explorer_orange1 : Color.explorer_bg2)};
  padding: 0;
  border-radius: 0.6rem;
  margin: 0 0.5rem;
  height: 2.5rem;
  width: 3.8rem;

  ${Media.upToSmall()} {
    padding: 0;
    margin: 0 0.5rem;
    font-size: 1.2rem;
    width: 3rem;
  }

  &:hover {
    color: ${Color.explorer_orange1};
    background-color: ${({ active }): string => (active ? Color.explorer_bg2 : Color.explorer_orangeOpacity)};
  }
`

export const StyledShimmerBar = styled(ShimmerBar)`
  margin: 1.2rem 0;
  min-width: 10rem;
`

export const WrapperTooltipPrice = styled.div<{ left: number; top: number; height?: number; width?: number }>`
  color: ${Color.explorer_textPrimary};
  background-color: ${Color.explorer_bg2};
  border: 1px solid ${Color.explorer_border};
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
    color: ${Color.explorer_textPrimary};
  }

  > p {
    color: ${Color.explorer_grey};
    font-size: 1.1rem;
    padding: 0;
  }
`
