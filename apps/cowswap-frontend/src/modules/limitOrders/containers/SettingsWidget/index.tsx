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
  const isUsdValuesMode = settingsState.isUsdValuesMode

  return (
    <ButtonsContainer>
      <UsdButton onClick={() => updateSettingsState({ isUsdValuesMode: !isUsdValuesMode })} active={isUsdValuesMode}>
        <SVG src={UsdIcon} />
      </UsdButton>
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
