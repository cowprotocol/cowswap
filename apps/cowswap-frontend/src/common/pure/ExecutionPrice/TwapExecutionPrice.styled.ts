import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Root = styled.span`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  flex-shrink: 0;
`

export const Amount = styled.span`
  ${font('FONT_LARGER', 'medium')}
  font-family: var(${UI.FONT_FAMILY_PRIMARY});
  letter-spacing: 0;
  color: var(${UI.COLOR_TEXT});
  white-space: nowrap;

  > span {
    word-break: normal;
    white-space: nowrap;
  }
`

export const PairLabel = styled.span`
  ${font('FONT_SMALL', 'regular')}
  font-family: var(${UI.FONT_FAMILY_PRIMARY});
  letter-spacing: 0;
  color: var(${UI.COLOR_TEXT_SECONDARY});
`
