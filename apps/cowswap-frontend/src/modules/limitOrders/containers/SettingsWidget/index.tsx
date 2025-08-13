import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback } from 'react'

import { ContextMenu, ContextMenuButton, ContextMenuItem, ContextMenuList } from '@cowprotocol/ui'

import { ButtonsContainer, SettingsIcon } from 'modules/trade/pure/Settings'

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
      <ContextMenu>
        <ContextMenuButton onClick={() => analytics.openSettings()}>
          <SettingsIcon />
        </ContextMenuButton>
        <ContextMenuList portal={false}>
          <ContextMenuItem onSelect={() => null}>
            <div
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onMouseUp={(e) => e.stopPropagation()}
            >
              <Settings state={settingsState} onStateChanged={onSettingsChange} />
            </div>
          </ContextMenuItem>
        </ContextMenuList>
      </ContextMenu>
    </ButtonsContainer>
  )
}
