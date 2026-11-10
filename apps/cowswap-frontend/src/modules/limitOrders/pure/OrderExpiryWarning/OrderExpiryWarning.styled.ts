import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ProminentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`

export const AcknowledgeBox = styled.div`
  color: var(${UI.COLOR_DANGER_TEXT});
  background: var(${UI.COLOR_DANGER_BG});
  ${font('FONT_SMALL', 'medium')}
  text-align: center;
  padding: 12px 16px 16px;
  border-radius: 0 0 16px 16px;

  label {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    cursor: pointer;
  }
`
