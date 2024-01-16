import { UI } from '@cowprotocol/ui'
import { ExternalLink } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

export const MenuBadge = styled.div`
  display: flex;
  align-items: center;
  padding: 3px 5px;
  margin: 0 0 0 5px;
  background: var(${UI.COLOR_BADGE_YELLOW_BG});
  color: var(${UI.COLOR_BADGE_YELLOW_TEXT});
  border: 0;
  cursor: pointer;
  border-radius: 16px;
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.2px;
  font-weight: 600;
  transition: color var(${UI.ANIMATION_DURATION}) ease-in-out;
  text-decoration: none;
`

export const StyledExternalLink = styled(ExternalLink)`
  &&:hover {
    text-decoration: none;
  }

  &:hover > span {
    text-decoration: underline;
  }
`
