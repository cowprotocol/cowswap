import { ReactNode } from 'react'
import styled, { useTheme } from 'styled-components/macro' // import useTheme
import { lighten, darken, transparentize } from 'polished'
import SVG from 'react-inlinesvg'
import iconAlert from 'assets/cow-swap/alert.svg'
import iconInformation from 'assets/cow-swap/alert-circle.svg'
import iconSuccess from 'assets/cow-swap/check.svg'
import iconDanger from 'assets/cow-swap/alert.svg'

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
  color: ${({ theme, color }) => (theme.darkMode ? lighten(0.2, color) : darken(0.15, color))};
  gap: 10px;
  border-radius: 10px;
  margin: 8px auto 0;
  padding: 16px 12px;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;

  > svg {
    display: block;
    width: 75px;
  }

  > svg > path {
    fill: ${({ color }) => color};
  }
`

export type InlineBannerProps = {
  content: ReactNode
  className?: string
  type?: BannerType
}

export function InlineBanner({ content, className, type = 'alert' }: InlineBannerProps) {
  const theme = useTheme()
  const config = BANNER_CONFIG[type]
  const color = theme[config.colorKey]

  return (
    <Wrapper className={className} color={color}>
      <SVG src={config.icon} description={type} />
      <span>{content}</span>
    </Wrapper>
  )
}
