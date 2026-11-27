import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const CowParticipation = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  color: var(${UI.COLOR_TEXT_SECONDARY});
`

export const CowMark = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 12px;

  > span {
    height: 12px !important;
  }

  > span > svg {
    width: 18px;
    height: 12px;
  }
`

export const CowParticipationLabel = styled.span`
  ${font('FONT_SMALL', 'semibold')}
  font-family: var(${UI.FONT_FAMILY_PRIMARY});
  white-space: nowrap;
  color: var(${UI.COLOR_TEXT_SECONDARY});
`
