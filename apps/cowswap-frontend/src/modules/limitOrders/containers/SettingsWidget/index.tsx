import { useAtomValue, useSetAtom } from 'jotai'

import { Menu, MenuItem, MenuPopover, MenuItems } from '@reach/menu-button'

import { openLimitOrderSettingsAnalytics } from 'modules/analytics'
import { ButtonsContainer, SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import { Settings } from '../../pure/Settings'
import { limitOrdersSettingsAtom, updateLimitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'

export function SettingsWidget() {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)

  const handleClick = () => {
    openLimitOrderSettingsAnalytics()
  }

  return (
    <ButtonsContainer>
      <Menu>
        <SettingsButton onClick={handleClick}>
          <SettingsIcon />
        </SettingsButton>
        <MenuPopover portal={false}>
          <MenuItems>
            <MenuItem onSelect={() => {}}>
              <Settings state={settingsState} onStateChanged={updateSettingsState} />
            </MenuItem>
          </MenuItems>
        </MenuPopover>
      </Menu>
    </ButtonsContainer>
  )
}
