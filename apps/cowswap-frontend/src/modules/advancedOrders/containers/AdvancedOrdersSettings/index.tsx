import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { Menu, MenuItem, MenuPopover, MenuItems } from '@reach/menu-button'
import styled from 'styled-components/macro'

import { Settings } from 'modules/advancedOrders/pure/Settings'
import { SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import {
  advancedOrdersSettingsAtom,
  AdvancedOrdersSettingsState,
  updateAdvancedOrdersSettingsAtom,
} from '../../state/advancedOrdersSettingsAtom'

const MenuWrapper = styled.div`
  [data-reach-menu-popover] {
    position: absolute;
    width: 100%;
    left: 0;
    top: 0;
  }
`

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
    <MenuWrapper>
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
    </MenuWrapper>
  )
}
