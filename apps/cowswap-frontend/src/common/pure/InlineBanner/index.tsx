import { ReactNode } from 'react'

import { UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Icon, IconType } from 'common/pure/Icon'
import { BannerOrientation } from 'common/pure/InlineBanner/banners'

export type BannerType = 'alert' | 'information' | 'success' | 'danger' | 'savings'

interface ColorEnums {
  icon?: IconType
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
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ colorEnums }) => `var(${colorEnums.bg})`};
  color: ${({ colorEnums }) => `var(${colorEnums.text})`};
  gap: 24px 10px;
  border-radius: ${({ borderRadius = '16px' }) => borderRadius};
  margin: auto;
  padding: ${({ padding = '16px' }) => padding};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  width: 100%;

  > span {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: ${({ orientation = BannerOrientation.Vertical }) =>
      orientation === BannerOrientation.Horizontal ? 'row' : 'column wrap'};
    gap: 10px;
    width: 100%;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-flow: column wrap;
      gap: 16px;
    `};
  }

  > span > strong {
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${({ colorEnums }) => `var(${colorEnums.text})`};
  }

  > span > p {
    line-height: 1.4;
    margin: auto;
    padding: 0;
    width: 100%;
    text-align: ${({ orientation = BannerOrientation.Vertical }) =>
      orientation === BannerOrientation.Horizontal ? 'left' : 'center'};
  }

  > span > i {
    font-style: normal;
    font-size: 32px;
    line-height: 1;
  }
`

export type InlineBannerProps = {
  children?: ReactNode
  className?: string
  hideIcon?: boolean
  bannerType?: BannerType
  borderRadius?: string
  orientation?: BannerOrientation
  iconSize?: number
  iconPadding?: string
  padding?: string
}

export function InlineBanner({
  children,
  className,
  hideIcon,
  bannerType,
  borderRadius,
  orientation,
  iconSize,
  iconPadding,
  padding,
}: InlineBannerProps) {
  const effectiveBannerType = bannerType || 'alert'
  const colorEnums = getColorEnums(effectiveBannerType)

  return (
    <Wrapper
      className={className}
      colorEnums={colorEnums}
      borderRadius={borderRadius}
      orientation={orientation}
      padding={padding}
    >
      <span>
        {!hideIcon && colorEnums.icon && (
          <Icon
            image={colorEnums.icon}
            size={iconSize}
            color={colorEnums.color}
            description={bannerType}
            padding={iconPadding}
          />
        )}
        {!hideIcon && colorEnums.iconText && <i>{colorEnums.iconText}</i>}
        {children}
      </span>
    </Wrapper>
  )
}
