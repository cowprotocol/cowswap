import React, { ReactNode } from 'react'

import { X } from 'react-feather'
import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import { UI } from '../../enum'
import { Icon, IconType } from '../../pure/Icon'

export enum BannerOrientation {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
}

export type BannerType = 'alert' | 'information' | 'success' | 'danger' | 'savings'

interface ColorEnums {
  icon?: IconType
  iconColor?: string
  iconText?: string
  color: UI
  bg: string
  text: string
}

const colorEnumsMap: Record<BannerType, ColorEnums> = {
  alert: {
    icon: IconType.ALERT,
    color: UI.COLOR_ALERT_TEXT,
    bg: UI.COLOR_ALERT_BG,
    text: UI.COLOR_ALERT_TEXT,
  },
  information: {
    icon: IconType.INFORMATION,
    color: UI.COLOR_INFO_TEXT,
    bg: UI.COLOR_INFO_BG,
    text: UI.COLOR_INFO_TEXT,
  },
  success: {
    icon: IconType.SUCCESS,
    iconColor: UI.COLOR_SUCCESS,
    color: UI.COLOR_SUCCESS_TEXT,
    bg: UI.COLOR_SUCCESS_BG,
    text: UI.COLOR_SUCCESS_TEXT,
  },
  danger: {
    icon: IconType.DANGER,
    color: UI.COLOR_DANGER_TEXT,
    bg: UI.COLOR_DANGER_BG,
    text: UI.COLOR_DANGER_TEXT,
  },
  savings: {
    iconText: '💸',
    color: UI.COLOR_SUCCESS_TEXT,
    bg: UI.COLOR_SUCCESS_BG,
    text: UI.COLOR_SUCCESS_TEXT,
  },
}

function getColorEnums(bannerType: BannerType): ColorEnums {
  return colorEnumsMap[bannerType] || colorEnumsMap.alert
}

const Wrapper = styled.span<{
  colorEnums: ColorEnums
  borderRadius?: string
  orientation?: BannerOrientation
  iconSize?: number
  padding?: string
  margin?: string
  width?: string
  dismissable?: boolean
  backDropBlur?: boolean
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  background: ${({ colorEnums }) => `var(${colorEnums.bg})`};
  color: ${({ colorEnums }) => `var(${colorEnums.text})`};
  gap: 24px 10px;
  border-radius: ${({ borderRadius = '16px' }) => borderRadius};
  margin: ${({ margin = 'auto' }) => margin};
  padding: ${({ dismissable, padding = '16px' }) => (dismissable ? '16px 32px 16px 16px' : padding)};
  font-size: 14px;
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

const CloseIcon = styled(X as any)`
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

export interface InlineBannerProps {
  children?: ReactNode
  className?: string
  hideIcon?: boolean
  bannerType?: BannerType
  borderRadius?: string
  orientation?: BannerOrientation
  iconSize?: number
  iconPadding?: string
  customIcon?: string | ReactNode
  padding?: string
  margin?: string
  width?: string
  noWrapContent?: boolean
  onClose?: () => void
  backDropBlur?: boolean
}

export function InlineBanner({
  children,
  className,
  hideIcon,
  bannerType = 'information',
  borderRadius,
  orientation,
  iconSize,
  iconPadding = '0',
  customIcon,
  padding,
  margin,
  width,
  onClose,
  noWrapContent,
  backDropBlur,
}: InlineBannerProps) {
  const colorEnums = getColorEnums(bannerType)

  return (
    <Wrapper
      className={className}
      colorEnums={colorEnums}
      borderRadius={borderRadius}
      orientation={orientation}
      padding={padding}
      margin={margin}
      width={width}
      dismissable={!!onClose}
      backDropBlur={backDropBlur}
    >
      <span>
        {!hideIcon && customIcon ? (
          typeof customIcon === 'string' ? (
            <SVG src={customIcon} width={iconSize} height={iconSize} />
          ) : (
            customIcon
          )
        ) : !hideIcon && colorEnums.icon ? (
          <Icon
            image={colorEnums.icon}
            size={iconSize}
            color={colorEnums.color}
            description={bannerType}
            padding={iconPadding}
          />
        ) : !hideIcon && colorEnums.iconText ? (
          <i>{colorEnums.iconText}</i>
        ) : null}
        {noWrapContent ? children : <span>{children}</span>}
      </span>

      {onClose && <CloseIcon onClick={onClose} />}
    </Wrapper>
  )
}
