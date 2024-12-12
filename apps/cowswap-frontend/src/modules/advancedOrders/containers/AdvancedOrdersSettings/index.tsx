import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { Menu, MenuItem, MenuPopover, MenuItems } from '@reach/menu-button'

import { Settings } from 'modules/advancedOrders/pure/Settings'
import { SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import {
  advancedOrdersSettingsAtom,
  AdvancedOrdersSettingsState,
  updateAdvancedOrdersSettingsAtom,
} from '../../state/advancedOrdersSettingsAtom'

export function AdvancedOrdersSettings() {
  const settingsState = useAtomValue(advancedOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateAdvancedOrdersSettingsAtom)

  const onStateChanged = useCallback(
    (state: Partial<AdvancedOrdersSettingsState>) => {
      updateSettingsState(state)
    },
    [updateSettingsState],
  )

  return (
    <Menu>
      <SettingsButton>
        <SettingsIcon />
      </SettingsButton>
      <MenuPopover portal={false}>
        <MenuItems>
          <MenuItem disabled={true} onSelect={() => void 0}>
            <Settings state={settingsState} onStateChanged={onStateChanged} />
          </MenuItem>
        </MenuItems>
      </MenuPopover>
    </Menu>
  )
}
