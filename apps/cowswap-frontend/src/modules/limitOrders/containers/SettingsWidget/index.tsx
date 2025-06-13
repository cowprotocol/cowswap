import { useAtomValue, useSetAtom } from 'jotai'
import { useCallback } from 'react'

import { Menu, MenuItem, MenuPopover, MenuItems } from '@reach/menu-button'

import { ButtonsContainer, SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import { useLimitOrderSettingsAnalytics } from '../../hooks/useLimitOrderSettingsAnalytics'
import { useUpdateLimitOrdersRawState } from '../../hooks/useLimitOrdersRawState'
import { Settings } from '../../pure/Settings'
import {
  limitOrdersSettingsAtom,
  LimitOrdersSettingsState,
  updateLimitOrdersSettingsAtom,
} from '../../state/limitOrdersSettingsAtom'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SettingsWidget() {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const analytics = useLimitOrderSettingsAnalytics()
  const updateLimitOrdersRawState = useUpdateLimitOrdersRawState()

  const onSettingsChange = useCallback(
    (update: Partial<LimitOrdersSettingsState>) => {
      updateSettingsState(update)
      if (update.showRecipient === false) {
        updateLimitOrdersRawState({ recipient: undefined, recipientAddress: undefined })
      }
    },
    [updateSettingsState, updateLimitOrdersRawState],
  )

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
                <Settings state={settingsState} onStateChanged={onSettingsChange} />
              </div>
            </MenuItem>
          </MenuItems>
        </MenuPopover>
      </Menu>
    </ButtonsContainer>
  )
}
