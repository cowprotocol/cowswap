import { Color, Media, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const MatchCard = styled.div`
  flex: 0 0 auto;
  width: 470px;
  max-width: 100%;
  margin: 0 0 0 auto;
  padding: 32px;
  border-radius: 32px;
  background: ${Color.cowfi_purple3};
  color: ${Color.cowfi_purple_bright};
  box-shadow: 0 32px 64px -32px rgba(73, 0, 114, 0.6);

  ${Media.upToMedium()} {
    width: 100%;
    margin: 0 auto 24px;
    padding: 24px;
  }
`

export const MatchCardImage = styled.div`
  aspect-ratio: 16 / 9;
  margin: 0 0 24px;
  border-radius: 24px;
  overflow: hidden;
  background: ${Color.cowfi_purple2};

  svg {
    width: 100%;
    height: 100%;
  }
`

export const MatchCardTitle = styled.h2`
  margin: 0;
  font-size: 38px;
  line-height: 1.1;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  color: ${Color.neutral98};
`

export const MatchCardSubtitle = styled.p`
  margin: 8px 0 24px;
  font-size: 18px;
  font-weight: var(${UI.FONT_WEIGHT_MEDIUM});
`

export const MatchCardRows = styled.dl`
  display: grid;
  gap: 16px;
  margin: 0;

  > div {
    padding: 0 0 16px;
    border-bottom: 1px solid rgba(249, 150, 238, 0.25);
  }

  > div:last-child {
    padding: 0;
    border: 0;
  }

  dt {
    margin: 0 0 4px;
    font-size: 14px;
    font-weight: var(${UI.FONT_WEIGHT_BOLD});
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: ${Color.cowfi_purple4};
  }

  dd {
    margin: 0;
    font-size: 18px;
    line-height: 1.4;
    color: ${Color.neutral98};
  }
`

export const SignOff = styled.p`
  margin: 0;
  font-size: 21px;
  font-weight: var(${UI.FONT_WEIGHT_BOLD});
  color: ${Color.cowfi_purple3};
`

export const DeveloperParagraphs = styled.div`
  display: grid;
  gap: 12px;
  margin: 16px 0;

  > p {
    margin: 0;
    font-size: 18px;
    line-height: 1.5;
    color: inherit;
  }
`
