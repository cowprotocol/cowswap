import { useAtomValue, useSetAtom } from 'jotai'
import React from 'react'

import { Menu, MenuItem } from '@reach/menu-button'

import { MenuContent, SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import { Settings } from '../../pure/Settings'
import { limitOrdersSettingsAtom, updateLimitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'

export function SettingsWidget() {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)

  return (
    <>
      <Menu>
        <SettingsButton>
          <SettingsIcon />
        </SettingsButton>
        <MenuContent>
          <MenuItem disabled={true} onSelect={() => void 0}>
            <Settings state={settingsState} onStateChanged={updateSettingsState} />
          </MenuItem>
        </MenuContent>
      </Menu>
    </>
  )
}
