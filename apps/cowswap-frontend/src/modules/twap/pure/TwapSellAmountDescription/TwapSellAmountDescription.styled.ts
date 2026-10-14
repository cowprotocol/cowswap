import { font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const Description = styled.p`
  ${font('FONT_SMALL_PLUS', 'regular')}
  font-family: var(${UI.FONT_FAMILY_PRIMARY});
  margin: 0;
  letter-spacing: 0;
  color: var(${UI.COLOR_TEXT_SECONDARY});
  padding-left: 6px;
`
