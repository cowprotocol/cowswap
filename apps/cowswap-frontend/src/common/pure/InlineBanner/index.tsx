import { ReactNode } from 'react'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

import iconInformation from 'legacy/assets/cow-swap/alert-circle.svg'
import iconAlert from 'legacy/assets/cow-swap/alert.svg'
import iconDanger from 'legacy/assets/cow-swap/alert.svg'
import iconSuccess from 'legacy/assets/cow-swap/check.svg'

import { UI } from 'common/constants/theme'
import { BannerOrientation } from 'common/pure/InlineBanner/banners'

export type BannerType = 'alert' | 'information' | 'success' | 'danger' | 'savings';

interface ColorEnums {
  icon?: string;
  iconText?: string;
  color: string;
  bg: string;
  text: string;
}

function getColorEnums(bannerType: BannerType): ColorEnums {
  switch (bannerType) {
    case 'alert':
      return {
        icon: iconAlert,
        color: UI.COLOR_ALERT,
        bg: UI.COLOR_ALERT_BG,
        text: UI.COLOR_ALERT_TEXT,
      };
    case 'information':
      return {
        icon: iconInformation,
        color: UI.COLOR_INFORMATION,
        bg: UI.COLOR_INFORMATION_BG,
        text: UI.COLOR_INFORMATION_TEXT,
      };
    case 'success':
      return {
        icon: iconSuccess,
        color: UI.COLOR_SUCCESS,
        bg: UI.COLOR_SUCCESS_BG,
        text: UI.COLOR_SUCCESS_TEXT,
      };
    case 'danger':
      return {
        icon: iconDanger,
        color: UI.COLOR_DANGER,
        bg: UI.COLOR_DANGER_BG,
        text: UI.COLOR_DANGER_TEXT,
      };
    case 'savings':
      return {
        iconText: '💸',
        color: UI.COLOR_SUCCESS,
        bg: UI.COLOR_SUCCESS_BG,
        text: UI.COLOR_SUCCESS_TEXT,
      };
    default:
      return {
        icon: iconAlert,
        color: UI.COLOR_ALERT,
        bg: UI.COLOR_ALERT_BG,
        text: UI.COLOR_ALERT_TEXT,
      };
  }
}

const Wrapper = styled.span<{ colorEnums: ColorEnums; borderRadius?: string; orientation?: BannerOrientation; iconSize?: number; padding?: string }>`
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
    flex-flow: ${({ orientation = BannerOrientation.Vertical }) => (orientation === BannerOrientation.Horizontal ? 'row' : 'column wrap')};
    gap: 10px;
    width: 100%;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-flow: column wrap;
      gap: 16px;
    `};
  }

  > span > svg {
    --size: ${({ iconSize = 32 }) => `${iconSize}px`};
    display: block;
    min-width: var(--size);
    min-height: var(--size);
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    stroke: none !important;
  }

  > span > svg > path {
    fill: ${({ colorEnums }) => `var(${colorEnums.color})`};
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
    text-align: ${({ orientation = BannerOrientation.Vertical }) => (orientation === BannerOrientation.Horizontal ? 'left' : 'center')};
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
  padding?: string
}

export function InlineBanner({ children, className, hideIcon, bannerType = 'alert', borderRadius, orientation, iconSize, padding }: InlineBannerProps) {
  const colorEnums = getColorEnums(bannerType);

  return (
    <Wrapper className={className} colorEnums={colorEnums} borderRadius={borderRadius} orientation={orientation} iconSize={iconSize} padding={padding}>
      <span>
        {!hideIcon && colorEnums.icon && <SVG src={colorEnums.icon} description={bannerType} />}
        {!hideIcon && colorEnums.iconText && <i>{colorEnums.iconText}</i>}
        {children}
      </span>
    </Wrapper>
  );
}
