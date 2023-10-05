import { useState } from 'react'

import { getTokenListViewLink, TokenListInfo } from '@cowprotocol/tokens'

import { Menu, MenuItem } from '@reach/menu-button'
import { Settings } from 'react-feather'

import { Toggle } from 'legacy/components/Toggle'

import * as styledEl from './styled'

import { TokenListDetails } from '../TokenListDetails'

export interface TokenListItemProps {
  list: TokenListInfo
  enabled: boolean
  toggleList(id: string): void
  removeList(id: string): void
}

export function TokenListItem(props: TokenListItemProps) {
  const { list, removeList, toggleList, enabled } = props

  const [isActive, setIsActive] = useState(enabled)

  const toggle = () => {
    toggleList(list.id)
    setIsActive((state) => !state)
  }

  return (
    <styledEl.Wrapper $enabled={isActive}>
      <TokenListDetails list={list}>
        <Menu>
          <styledEl.SettingsButton>
            <Settings size={12} />
          </styledEl.SettingsButton>
          <styledEl.SettingsContainer>
            <MenuItem onSelect={() => void 0}>
              <styledEl.ListVersion>{list.version}</styledEl.ListVersion>
            </MenuItem>
            <MenuItem onSelect={() => void 0}>
              <styledEl.SettingsAction>
                <a target="_blank" href={getTokenListViewLink(list.source)} rel="noreferrer">
                  View List
                </a>
              </styledEl.SettingsAction>
            </MenuItem>
            <MenuItem onSelect={() => removeList(list.id)}>
              <styledEl.SettingsAction>Remove list</styledEl.SettingsAction>
            </MenuItem>
          </styledEl.SettingsContainer>
        </Menu>
      </TokenListDetails>
      <div>
        <Toggle isActive={isActive} toggle={toggle} />
      </div>
    </styledEl.Wrapper>
  )
}
