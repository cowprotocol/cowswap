import { ExternalLink, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { Card } from 'pages/Account/styled'

const DEFAULT_CARD_MAX_WIDTH = 540

export const HeroCard = styled(Card)<{ $maxWidth?: number }>`
  max-width: ${({ $maxWidth }) => `${$maxWidth ?? DEFAULT_CARD_MAX_WIDTH}px`};
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(${UI.COLOR_BLUE_100_PRIMARY});
  padding: 40px 32px 16px;
`

export const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  align-items: center;
`

export const HeroTitle = styled.h2<{ $maxWidth?: number }>`
  margin: 0;
  width: 100%;
  max-width: ${({ $maxWidth }) => ($maxWidth ? `${$maxWidth}px` : 'none')};
  padding: 0 10px;
  font-size: 38px;
  font-weight: 700;
  color: var(${UI.COLOR_TEXT});
  text-align: center;
`

export const HeroSubtitle = styled.p<{ $maxWidth?: number }>`
  margin: 0;
  width: 100%;
  max-width: ${({ $maxWidth }) => ($maxWidth ? `${$maxWidth}px` : 'none')};
  font-size: 16px;
  line-height: 1.5;
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  text-align: center;

  a {
    color: var(${UI.COLOR_LINK});
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`

export const HeroActions = styled.div`
  display: flex;
  flex-flow: column wrap;
  align-items: center;
  justify-content: center;
  gap: 24px;
  margin: 16px auto;
`

export const AffiliateInlineLink = styled(ExternalLink)`
  color: var(${UI.COLOR_LINK});
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 2px;
  transition: text-decoration-thickness var(${UI.ANIMATION_DURATION}) ease-in-out;

  &:hover,
  &:focus-visible {
    text-decoration-thickness: 2px;
  }
`
