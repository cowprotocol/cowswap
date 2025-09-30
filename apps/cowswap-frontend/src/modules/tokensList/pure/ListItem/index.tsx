import { ReactNode, useState } from 'react'

import { useCowAnalytics } from '@cowprotocol/analytics'
import { getTokenListViewLink, ListState } from '@cowprotocol/tokens'
import {
  ContextMenuTooltip,
  ContextMenuExternalLink,
  ContextMenuItemButton,
  ContextMenuItemText,
} from '@cowprotocol/ui'

import { Trans, useLingui } from '@lingui/react/macro'
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
}

export function ListItem(props: TokenListItemProps): ReactNode {
  const { list, removeList, toggleList, enabled } = props
  const [isActive, setIsActive] = useState(enabled)
  const cowAnalytics = useCowAnalytics()
  const { t } = useLingui()

  const toggle = (): void => {
    toggleList(list, enabled)
    setIsActive((state) => !state)

    const newState = !enabled
    cowAnalytics.sendEvent({
      category: CowSwapAnalyticsCategory.LIST,
      action: `List ${newState ? 'Enabled' : 'Disabled'}`,
      label: list.source,
    })
  }

  const handleRemove = (): void => {
    removeList(list)
  }

  const { major, minor, patch } = list.list.version

  return (
    <styledEl.Wrapper $enabled={isActive}>
      <TokenListDetails list={list.list}>
        <ContextMenuTooltip
          content={
            <>
              <ContextMenuItemText>
                v{major}.{minor}.{patch}
              </ContextMenuItemText>
              <ContextMenuExternalLink
                href={getTokenListViewLink(list.source)}
                label={t`View List`}
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
