import { ReactNode } from 'react'

import { getTokenListViewLink, ListState } from '@cowprotocol/tokens'
import {
  ContextMenuTooltip,
  ContextMenuExternalLink,
  ContextMenuItemButton,
  ContextMenuItemText,
} from '@cowprotocol/ui'

import { Trans } from '@lingui/react/macro'
import { Settings, Trash2 } from 'react-feather'

import { Toggle } from 'legacy/components/Toggle'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

import { TokenListDetails } from '../TokenListDetails'

export interface TokenListItemProps {
  list: ListState
  enabled: boolean
  toggleList(list: ListState, enabled: boolean): void
  removeList(list: ListState): void
  viewListLabel: string
}

export function ListItem(props: TokenListItemProps): ReactNode {
  const { list, removeList, toggleList, enabled, viewListLabel } = props

  const toggle = (): void => {
    toggleList(list, enabled)
  }

  const handleRemove = (): void => {
    removeList(list)
  }

  const { major, minor, patch } = list.list.version

  return (
    <styledEl.Wrapper $enabled={enabled}>
      <TokenListDetails list={list.list}>
        <ContextMenuTooltip
          content={
            <>
              <ContextMenuItemText>
                v{major}.{minor}.{patch}
              </ContextMenuItemText>
              <ContextMenuExternalLink
                href={getTokenListViewLink(list.source)}
                label={viewListLabel}
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.LIST,
                  action: 'View List',
                  label: list.source,
                })}
              />
              <ContextMenuItemButton
                variant="danger"
                onClick={handleRemove}
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.LIST,
                  action: 'Remove List',
                  label: list.source,
                })}
              >
                <Trash2 size={16} />
                <span>
                  <Trans>Remove list</Trans>
                </span>
              </ContextMenuItemButton>
            </>
          }
        >
          <styledEl.SettingsButton>
            <Settings size={14} />
          </styledEl.SettingsButton>
        </ContextMenuTooltip>
      </TokenListDetails>
      <div>
        <Toggle
          isActive={enabled}
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
