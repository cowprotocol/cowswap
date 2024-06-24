import IMAGE_ICON_SETTINGS_ALT from '@cowprotocol/assets/images/icon-settings-alt.svg'
import { UI } from '@cowprotocol/ui'

import SVG from 'react-inlinesvg'
import styled from 'styled-components/macro'

const StyledMenuIcon = styled.span`
  height: var(${UI.ICON_SIZE_NORMAL});
  width: var(${UI.ICON_SIZE_NORMAL});
  opacity: 0.6;

  &:hover {
    opacity: 1;
  }
`

export function SettingsIcon() {
  return (
    <StyledMenuIcon>
      <SVG src={IMAGE_ICON_SETTINGS_ALT} />
    </StyledMenuIcon>
  )
}
