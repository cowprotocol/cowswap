import { useAtomValue, useSetAtom } from 'jotai'
import React, { useCallback } from 'react'

import { Menu, MenuItem } from '@reach/menu-button'

import { MenuContent, SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import { Settings } from '../../pure/Settings'
import {
  limitOrdersSettingsAtom,
  LimitOrdersSettingsState,
  updateLimitOrdersSettingsAtom,
} from '../../state/limitOrdersSettingsAtom'

export function SettingsWidget() {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)

  const onStateChanged = useCallback(
    (state: Partial<LimitOrdersSettingsState>) => {
      updateSettingsState(state)
    },
    [updateSettingsState]
  )

  return (
    <>
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
    </>
  )
}
