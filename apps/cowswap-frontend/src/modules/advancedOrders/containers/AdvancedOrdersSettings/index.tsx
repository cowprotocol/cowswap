import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai'
import { useCallback } from 'react'

import { Menu, MenuItem } from '@reach/menu-button'

import { Settings } from 'modules/advancedOrders/pure/Settings'
import { MenuContent, SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import {
  advancedOrdersSettingsAtom,
  updateAdvancedOrdersSettingsAtom,
  AdvancedOrdersSettingsState,
} from '../../state/advancedOrdersSettingsAtom'

export function AdvancedOrdersSettings() {
  const settingsState = useAtomValue(advancedOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateAdvancedOrdersSettingsAtom)

  const onStateChanged = useCallback(
    (state: Partial<AdvancedOrdersSettingsState>) => {
      updateSettingsState(state)
    },
    [updateSettingsState]
  )

  return (
    <Menu>
      <SettingsButton>
        <SettingsIcon />
      </SettingsButton>
      <MenuContent>
        <MenuItem disabled={true} onSelect={() => void 0}>
          <Settings state={settingsState} onStateChanged={onStateChanged} />
        </MenuItem>
      </MenuContent>
    </Menu>
  )
}
