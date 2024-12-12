import { useAtomValue, useSetAtom } from 'jotai'

import UsdIcon from '@cowprotocol/assets/images/icon-USD.svg'

import { Menu, MenuItem, MenuPopover, MenuItems } from '@reach/menu-button'
import SVG from 'react-inlinesvg'

import { ButtonsContainer, SettingsButton, SettingsIcon, UsdButton } from 'modules/trade/pure/Settings'

import { Settings } from '../../pure/Settings'
import { limitOrdersSettingsAtom, updateLimitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'

export function SettingsWidget() {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)

  return (
    <ButtonsContainer>
      {/* TODO: add active state */}
      <UsdButton active={false}>
        <SVG src={UsdIcon} />
      </UsdButton>
      <Menu>
        <SettingsButton>
          {/* TODO: add active state */}
          <SettingsIcon active={false} />
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
