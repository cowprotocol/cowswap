import { useState } from 'react'

import { Menu, MenuItem } from '@reach/menu-button'
import { Settings } from 'react-feather'

import { Toggle } from 'legacy/components/Toggle'

import * as styledEl from './styled'

import { IconButton } from '../commonElements'

export interface TokenList {
  id: string
  name: string
  logoUrl: string
  url: string
  enabled: boolean
  tokensCount: number
  version: string
}

export interface TokenListItemProps {
  list: TokenList
  removeList(id: string): void
  viewList(id: string): void
}

export function TokenListItem(props: TokenListItemProps) {
  const { list, removeList, viewList } = props

  const [isActive, setIsActive] = useState(list.enabled)

  return (
    <styledEl.Wrapper $enabled={isActive}>
      <styledEl.ListInfo>
        <div>
          <img src={list.logoUrl} alt={list.name} width={36} height={36} />
        </div>
        <div>
          <styledEl.ListName>{list.name}</styledEl.ListName>
          <styledEl.TokensInfo>
            {list.tokensCount} tokens{' '}
            <Menu>
              <styledEl.SettingsButton>
                <IconButton>
                  <Settings size={12} />
                </IconButton>
              </styledEl.SettingsButton>
              <styledEl.SettingsContainer>
                <MenuItem onSelect={() => void 0}>
                  <styledEl.ListVersion>{list.version}</styledEl.ListVersion>
                </MenuItem>
                <MenuItem onSelect={() => viewList(list.id)}>
                  <styledEl.SettingsAction>View List</styledEl.SettingsAction>
                </MenuItem>
                <MenuItem onSelect={() => removeList(list.id)}>
                  <styledEl.SettingsAction>Remove list</styledEl.SettingsAction>
                </MenuItem>
              </styledEl.SettingsContainer>
            </Menu>
          </styledEl.TokensInfo>
        </div>
      </styledEl.ListInfo>
      <div>
        <Toggle isActive={isActive} toggle={() => setIsActive((state) => !state)} />
      </div>
    </styledEl.Wrapper>
  )
}
