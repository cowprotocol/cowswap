import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { Menu, MenuItem, MenuPopover, MenuItems } from '@reach/menu-button'

import { ButtonsContainer, SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { useLimitOrderSettingsAnalytics } from '../../hooks/useLimitOrderSettingsAnalytics'
import { useUpdateLimitOrdersRawState } from '../../hooks/useLimitOrdersRawState'
import { Settings } from '../../pure/Settings'
import {
  limitOrdersSettingsAtom,
  LimitOrdersSettingsState,
  updateLimitOrdersSettingsAtom,
} from '../../state/limitOrdersSettingsAtom'

export function SettingsWidget(): ReactNode {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const analytics = useLimitOrderSettingsAnalytics()
  const updateLimitOrdersRawState = useUpdateLimitOrdersRawState()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const isSettingsDisabled = isProviderNetworkUnsupported || isProviderNetworkDeprecated

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
        <SettingsButton disabled={isSettingsDisabled} onClick={() => analytics.openSettings()}>
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
