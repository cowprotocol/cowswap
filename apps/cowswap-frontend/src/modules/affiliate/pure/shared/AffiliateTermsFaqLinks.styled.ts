import { ExternalLink, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const LinksRow = styled.div<{ $align: 'inline' | 'center' }>`
  display: ${({ $align }) => ($align === 'center' ? 'flex' : 'inline-flex')};
  align-items: center;
  justify-content: ${({ $align }) => ($align === 'center' ? 'center' : 'flex-start')};
  gap: 8px;
  width: ${({ $align }) => ($align === 'center' ? '100%' : 'auto')};
  font-size: 12px;
  color: var(${UI.COLOR_TEXT_OPACITY_60});
`

export const Separator = styled.span`
  opacity: 0.6;
`

export const FooterLink = styled(ExternalLink)`
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-decoration: none;

  &:hover,
  &:focus-visible {
    color: var(${UI.COLOR_LINK});
    text-decoration: underline;
  }
`
