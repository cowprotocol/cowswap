import { Color, ExternalLink, Media, UI } from '@cowprotocol/ui'

import { darken } from 'color2k'
import { CheckCircle } from 'react-feather'
import styled from 'styled-components/macro'
import { CloseIcon as SharedCloseIcon } from 'theme'

export const Banner = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 12px 10px;
  color: ${darken(Color.successDark, 0.28)};
  background: ${Color.successDark};

  ${Media.upToMedium()} {
    align-items: flex-start;
    padding: 12px 16px;
  }
`

export const IconWrap = styled.div`
  --size: 28px;
  width: var(--size);
  height: var(--size);
  flex: 0 0 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--size);
  color: inherit;

  ${Media.upToSmall()} {
    width: 28px;
    height: 28px;
    flex-basis: 28px;
  }
`

export const Icon = styled(CheckCircle).attrs(() => ({
  size: 24,
  strokeWidth: 2.5,
}))`
  flex-shrink: 0;
  color: inherit;
`

export const Content = styled.div`
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  ${Media.upToMedium()} {
    align-items: flex-start;
    gap: 6px;
    flex-direction: column;
  }
`

export const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  line-height: 1;
  color: inherit;
  white-space: nowrap;

  ${Media.upToMedium()} {
    white-space: normal;
  }
`

export const TitleAccent = styled.span`
  color: inherit;
  font-weight: 200;
`

export const Description = styled.p`
  margin: 0;
  min-width: 0;
  font-size: 13px;
  line-height: 1.4;
  color: inherit;
`

export const Link = styled(ExternalLink)`
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;

  &:hover {
    color: inherit;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 4px;
  }
`

export const CloseIcon = styled(SharedCloseIcon).attrs(() => ({
  size: 24,
}))`
  cursor: inherit;
`

export const CloseButton = styled.button`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;

  &:hover ${CloseIcon} {
    opacity: 1;
  }

  &:focus-visible {
    outline: 2px solid currentColor;
    outline-offset: 2px;
    border-radius: 6px;
  }
`
