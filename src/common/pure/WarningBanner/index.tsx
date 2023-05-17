import { ReactNode } from 'react'
import styled from 'styled-components/macro'
import SVG from 'react-inlinesvg'
import Alert from '@src/assets/cow-swap/alert.svg'
import { darken, transparentize } from 'polished'

const Wrapper = styled.span`
  display: flex;
  align-items: center;
  background: ${({ theme }) => (theme.darkMode ? transparentize(0.9, theme.alert) : transparentize(0.85, theme.alert))};
  color: ${({ theme }) => darken(theme.darkMode ? 0 : 0.15, theme.alert)};
  gap: 10px;
  border-radius: 10px;
  margin: 8px auto 0;
  padding: 16px 12px;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.2;

  > svg {
    display: block;
    width: 75px;
  }

  > svg > path {
    fill: ${({ theme }) => theme.alert};
  }
`

export type WarningBannerProps = {
  content: ReactNode
  icon?: string
  className?: string
}

export function WarningBanner({ content, icon, className }: WarningBannerProps) {
  return (
    <Wrapper className={className}>
      <SVG src={icon || Alert} description="Alert" />
      <span>{content}</span>
    </Wrapper>
  )
}
