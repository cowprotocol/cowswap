import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

export const Description = styled.p`
  ${font('FONT_SMALL_PLUS', 'regular')}
  margin: 0;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  line-height: 1.4;
`

export const InfoBannerContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`

export const InfoBannerTitle = styled.strong`
  ${font('FONT_SMALL_PLUS', 'semibold')}
  display: block;
  color: inherit;
`

export const InfoBannerDescription = styled.span`
  ${font('FONT_SMALL_PLUS', 'regular')}
  display: block;
  color: inherit;
`
