import { useAtomValue, useSetAtom } from 'jotai'

import { Menu, MenuItem, MenuPopover, MenuItems } from '@reach/menu-button'

import { ButtonsContainer, SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import { Settings } from '../../pure/Settings'
import { limitOrdersSettingsAtom, updateLimitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'
import { useLimitOrderSettingsAnalytics } from '../../utils/limitOrderSettingsAnalytics'

export function SettingsWidget() {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const analytics = useLimitOrderSettingsAnalytics()

  return (
    <ButtonsContainer>
      <Menu>
        <SettingsButton onClick={() => analytics.openSettings()}>
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
