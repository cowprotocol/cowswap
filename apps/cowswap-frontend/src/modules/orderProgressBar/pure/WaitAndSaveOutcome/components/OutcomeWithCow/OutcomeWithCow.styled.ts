import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const SubRow = styled.div`
  position: relative;
  min-width: 0;
  text-align: center;
`

export const SubText = styled.span`
  ${font('FONT_MEDIUM', 'regular')}
  color: var(${UI.COLOR_SUCCESS_TEXT});

  .noBreak > * {
    vertical-align: middle;
  }
`
