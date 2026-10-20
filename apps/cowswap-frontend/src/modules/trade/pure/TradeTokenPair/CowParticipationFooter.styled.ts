import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const CowParticipation = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
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
  color: var(${UI.COLOR_TEXT_OPACITY_70});
  white-space: nowrap;
`
