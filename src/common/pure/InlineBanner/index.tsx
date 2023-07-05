import { ReactNode } from 'react'

import { lighten, darken, transparentize } from 'polished'
import SVG from 'react-inlinesvg'
import styled, { useTheme } from 'styled-components/macro' // import useTheme

import iconInformation from 'legacy/assets/cow-swap/alert-circle.svg'
import iconAlert from 'legacy/assets/cow-swap/alert.svg'
import iconDanger from 'legacy/assets/cow-swap/alert.svg'
import iconSuccess from 'legacy/assets/cow-swap/check.svg'

type BannerType = 'alert' | 'information' | 'success' | 'danger'

interface BannerConfig {
  icon: string
  colorKey: BannerType
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
  danger: {
    icon: iconDanger,
    colorKey: 'danger',
  },
}

const Wrapper = styled.span<{ color: string }>`
  display: flex;
  align-items: center;
  background: ${({ theme, color }) => (theme.darkMode ? transparentize(0.9, color) : transparentize(0.85, color))};
  color: ${({ theme, color }) => (theme.darkMode ? lighten(0.2, color) : darken(0.2, color))};
  gap: 24px 10px;
  border-radius: 16px;
  margin: auto;
  padding: 16px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  width: 100%;

  > span {
    display: grid;
    align-items: center;
    justify-content: center;
    gap: 0 10px;
    grid-template-areas: "a b c" "d d d";
    grid-template-columns: minmax(max-content, 42px) minmax(min-content, 110px) minmax(min-content, 1fr);
    width: 100%;
    grid-auto-flow: dense;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      display: flex;
      flex-flow: column wrap;
      gap: 10px;
    `};
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
    grid-area: a;
  }

  > span > svg > path {
    fill: ${({ color }) => color};
  }

  > span > strong {
    display: block;
    grid-area: b;
  }

  > span > p {
    line-height: 1.4;
    margin: 0 0 16px;
    padding: 0;
    grid-area: c;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      text-align: center;
    `};
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
      <span>{!hideIcon && <SVG src={config.icon} description={type} />} {children}</span>
    </Wrapper>
  )
}
