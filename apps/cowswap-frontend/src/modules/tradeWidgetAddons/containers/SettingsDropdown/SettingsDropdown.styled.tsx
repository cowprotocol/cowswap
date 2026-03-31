import { RowFixed } from '@cowprotocol/ui'

import styled from 'styled-components/macro'

import { SettingsButton } from 'modules/trade/pure/Settings/styled'

// TODO: There's some duplication between this file and modules/trade/pure/Settings/styled.
// Using a re-export here until that's addressed properly.

export const StyledMenuButton = SettingsButton

export const StyledMenu = styled.div`
  margin: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  border: none;
  text-align: left;
  color: inherit;

  ${RowFixed} {
    color: inherit;

    > div {
      color: inherit;
      opacity: 0.85;
    }
  }
`
