import { X } from 'react-feather'
import styled from 'styled-components/macro'

import { UI } from '../../../enum'
import { StatusColorEnums } from '../../../theme/statusColors'
import { BannerOrientation } from '../shared/types'

export const Wrapper = styled.span<{
  colorEnums: StatusColorEnums
  borderRadius?: string
  orientation?: BannerOrientation
  iconSize?: number
  padding?: string
  margin?: string
  width?: string
  dismissable?: boolean
  backDropBlur?: boolean
  fontSize?: number
  noBackground?: boolean
  breakWord?: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: ${({ colorEnums, noBackground }) => (noBackground ? 'transparent' : `var(${colorEnums.bg})`)};
  color: ${({ colorEnums }) => `var(${colorEnums.text})`};
  gap: 24px 10px;
  border-radius: ${({ borderRadius = '16px' }) => borderRadius};
  margin: ${({ margin = 'auto' }) => margin};
  padding: ${({ dismissable, padding = '16px' }) => (dismissable ? '16px 32px 16px 16px' : padding)};
  font-size: ${({ fontSize = 14 }) => fontSize}px;
  font-weight: 400;
  line-height: 1.2;
  width: ${({ width = '100%' }) => width};
  backdrop-filter: ${({ backDropBlur }) => backDropBlur && 'blur(20px)'};

  // Icon + Text content wrapper
  > span {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: ${({ orientation = BannerOrientation.Vertical }) =>
      orientation === BannerOrientation.Horizontal ? 'row' : 'column wrap'};
    gap: 10px;
    width: auto;
  }

  > span > svg > path {
    fill: ${({ colorEnums }) => `var(${colorEnums.iconColor})`};
  }

  // Text content
  > span > span {
    width: 100%;
    display: flex;
    flex-flow: row wrap;
    align-items: center;
    gap: 10px;
    justify-content: ${({ orientation = BannerOrientation.Vertical }) =>
      orientation === BannerOrientation.Horizontal ? 'flex-start' : 'center'};

    a {
      color: inherit;
      text-decoration: underline;
    }

    > strong {
      display: flex;
      align-items: center;
      text-align: center;
      gap: 6px;
    }

    > p {
      line-height: 1.4;
      margin: auto;
      padding: 0;
      width: 100%;
      text-align: ${({ orientation = BannerOrientation.Vertical }) =>
        orientation === BannerOrientation.Horizontal ? 'left' : 'center'};
      ${({ breakWord }) => (breakWord ? 'word-break: break-word;' : '')}
    }

    > i {
      font-style: normal;
      font-size: 32px;
      line-height: 1;
    }

    > ol {
      padding-left: 20px;
    }
  }
`

export const CustomContentContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
`

export const CustomContentTop = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`

export const CustomContentBottom = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
  width: 100%;
`

export const CloseIcon = styled(X)`
  --size: 16px;
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 10px;
  stroke-width: 3px;
  transition: opacity var(${UI.ANIMATION_DURATION}) ease-in-out;
  height: var(--size);
  width: var(--size);
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`
