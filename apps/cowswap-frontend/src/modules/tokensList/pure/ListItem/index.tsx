import { useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { getTokenListViewLink, ListState } from '@cowprotocol/tokens'

import { Menu, MenuItem } from '@reach/menu-button'
import { Settings } from 'react-feather'

import { Toggle } from 'legacy/components/Toggle'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

import { TokenListDetails } from '../TokenListDetails'

export interface TokenListItemProps {
  list: ListState
  enabled: boolean
  toggleList(list: ListState, enabled: boolean): void
  removeList(list: ListState): void
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function ListItem(props: TokenListItemProps) {
  const { list, removeList, toggleList, enabled } = props
  const [isActive, setIsActive] = useState(enabled)
  const cowAnalytics = useCowAnalytics()

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const toggle = () => {
    toggleList(list, enabled)
    setIsActive((state) => !state)
    // Track the actual state change
    const newState = !enabled
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.LIST,
      action: `List ${newState ? 'Enabled' : 'Disabled'}`,
      label: list.source,
    })
  }

  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const handleRemove = () => {
    removeList(list)
  }

  const { major, minor, patch } = list.list.version

  return (
    <styledEl.Wrapper $enabled={isActive}>
      <TokenListDetails list={list.list}>
        <Menu>
          <styledEl.SettingsButton>
            <Settings size={12} />
          </styledEl.SettingsButton>
          <styledEl.SettingsContainer>
            <MenuItem onSelect={() => void 0}>
              <styledEl.ListVersion>
                v{major}.{minor}.{patch}
              </styledEl.ListVersion>
            </MenuItem>
            <MenuItem onSelect={() => void 0}>
              <styledEl.SettingsAction>
                <a
                  target="_blank"
                  href={getTokenListViewLink(list.source)}
                  rel="noreferrer"
                  data-click-event={toCowSwapGtmEvent({
                    category: CowSwapAnalyticsCategory.LIST,
                    action: 'View List',
                    label: list.source,
                  })}
                >
                  View List
                </a>
              </styledEl.SettingsAction>
            </MenuItem>
            <MenuItem onSelect={handleRemove}>
              <styledEl.SettingsAction
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.LIST,
                  action: 'Remove List',
                  label: list.source,
                })}
              >
                Remove list
              </styledEl.SettingsAction>
            </MenuItem>
          </styledEl.SettingsContainer>
        </Menu>
      </TokenListDetails>
      <div>
        <Toggle
          isActive={isActive}
          toggle={toggle}
          data-click-event={toCowSwapGtmEvent({
            category: CowSwapAnalyticsCategory.LIST,
            action: `${enabled ? 'Disable' : 'Enable'} List`,
            label: list.source,
          })}
        />
      </div>
    </styledEl.Wrapper>
  )
}
