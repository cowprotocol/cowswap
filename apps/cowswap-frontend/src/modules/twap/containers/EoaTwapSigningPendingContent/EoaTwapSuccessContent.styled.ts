import { ExternalLink, font, UI } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const ExplorerAnchor = styled(ExternalLink)`
  ${font('FONT_SMALL', 'medium')}
  display: block;
  width: 100%;
  text-align: center;
  color: ${({ theme }) => (theme.darkMode ? `var(${UI.COLOR_WHITE})` : `var(${UI.COLOR_LINK})`)};

  && {
    text-decoration: underline;
  }

  &:hover {
    color: var(${UI.COLOR_INFO});
  }
`
