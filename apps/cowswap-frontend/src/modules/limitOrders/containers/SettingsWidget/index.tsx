import { useAtomValue, useSetAtom } from 'jotai'

import { Menu, MenuItem, MenuPopover, MenuItems } from '@reach/menu-button'

import { openLimitOrderSettingsAnalytics } from 'modules/analytics'
import { ButtonsContainer, SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import { Settings } from '../../pure/Settings'
import { limitOrdersSettingsAtom, updateLimitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'

export function SettingsWidget() {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)

  return (
    <ButtonsContainer>
      <Menu>
        <SettingsButton onClick={openLimitOrderSettingsAnalytics}>
          <SettingsIcon />
        </SettingsButton>
        <MenuPopover portal={false}>
          <MenuItems>
            <MenuItem onSelect={() => null}>
              <div
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onMouseUp={(e) => e.stopPropagation()}
              >
                <Settings state={settingsState} onStateChanged={updateSettingsState} />
              </div>
            </MenuItem>
          </MenuItems>
        </MenuPopover>
      </Menu>
    </ButtonsContainer>
  )
}
