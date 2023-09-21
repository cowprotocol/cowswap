import { ReactNode } from 'react'

import iconInformation from '@cowprotocol/assets/cow-swap/alert-circle.svg'
import iconAlert from '@cowprotocol/assets/cow-swap/alert.svg'
import iconDanger from '@cowprotocol/assets/cow-swap/alert.svg'
import iconSuccess from '@cowprotocol/assets/cow-swap/check.svg'

import { lighten, darken, transparentize } from 'polished'
import SVG from 'react-inlinesvg'
import styled, { useTheme } from 'styled-components/macro' // import useTheme

type BannerType = 'alert' | 'information' | 'success' | 'danger' | 'savings'

interface BannerConfig {
  colorKey: Exclude<BannerType, 'savings'>
  icon?: string
  iconText?: string
}

const BANNER_CONFIG: Record<BannerType, BannerConfig> = {
  alert: {
    icon: iconAlert,
    colorKey: 'alert',
  },
  information: {
    icon: iconInformation,
    colorKey: 'information',
  },
  success: {
    icon: iconSuccess,
    colorKey: 'success',
  },
  savings: {
    iconText: '💸',
    colorKey: 'success',
  },
  danger: {
    icon: iconDanger,
    colorKey: 'danger',
  },
}

const Wrapper = styled.span<{ color: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme, color }) => (theme.darkMode ? transparentize(0.9, color) : transparentize(0.85, color))};
  color: ${({ theme, color }) => (theme.darkMode ? lighten(0.1, color) : darken(0.2, color))};
  gap: 24px 10px;
  border-radius: 16px;
  margin: auto;
  padding: 16px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  width: 100%;

  > span {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column wrap;
    gap: 10px;
    width: 100%;
  }

  > span > svg {
    --size: 32px;
    display: block;
    min-width: var(--size);
    min-height: var(--size);
    width: var(--size);
    height: var(--size);
    object-fit: contain;
    stroke: none !important;
  }

  > span > svg > path {
    fill: ${({ color }) => color};
  }

  > span {
    display: flex;
    flex-flow: row wrap;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex-flow: column wrap;
      gap: 16px;
    `};
  }

  > span > strong {
    display: flex;
    align-items: center;
    gap: 6px;
    color: ${({ theme, color }) => (theme.darkMode ? lighten(0.2, color) : darken(0.2, color))};
  }

  > span > p {
    line-height: 1.4;
    margin: auto;
    padding: 0;
    width: 100%;
    text-align: center;
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
  type?: BannerType
}

export function InlineBanner({ children, className, hideIcon, type = 'alert' }: InlineBannerProps) {
  const theme = useTheme()
  const config = BANNER_CONFIG[type]
  const color = theme[config.colorKey]

  return (
    <Wrapper className={className} color={color}>
      <span>
        {!hideIcon && config.icon && <SVG src={config.icon} description={type} />}
        {!hideIcon && config.iconText && <i>{config.iconText}</i>}
        {children}
      </span>
    </Wrapper>
  )
}
