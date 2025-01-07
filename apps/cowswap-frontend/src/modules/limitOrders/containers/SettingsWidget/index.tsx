import { useAtomValue, useSetAtom } from 'jotai'

import { Menu, MenuItem, MenuPopover, MenuItems } from '@reach/menu-button'

import { ButtonsContainer, SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import { Settings } from '../../pure/Settings'
import { limitOrdersSettingsAtom, updateLimitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'

export function SettingsWidget() {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)

  return (
    <ButtonsContainer>
      <Menu>
        <SettingsButton>
          <SettingsIcon />
        </SettingsButton>
        <MenuPopover portal={false}>
          <MenuItems>
            <MenuItem disabled={true} onSelect={() => void 0}>
              <Settings state={settingsState} onStateChanged={updateSettingsState} />
            </MenuItem>
          </MenuItems>
        </MenuPopover>
      </Menu>
    </ButtonsContainer>
  )
}
