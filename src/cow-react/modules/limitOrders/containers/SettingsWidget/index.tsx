import { useSetAtom } from 'jotai'
import { Menu, MenuItem } from '@reach/menu-button'
import {
  limitOrdersSettingsAtom,
  LimitOrdersSettingsState,
  updateLimitOrdersSettingsAtom,
} from '../../state/limitOrdersSettingsAtom'
import { Settings } from '../../pure/Settings'
import { ExpertModeModal } from '@cow/common/pure/ExpertModeModal'
import React, { useCallback, useState } from 'react'
import * as styledEl from './styled'
import { useAtomValue } from 'jotai/utils'

export function SettingsWidget() {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const [showExpertConfirm, setShowExpertConfirm] = useState(false)

  const onStateChanged = useCallback(
    (state: Partial<LimitOrdersSettingsState>) => {
      const isExpertModeOn = !settingsState.expertMode && state.expertMode
      const isExpertModeOff = settingsState.expertMode && !state.expertMode

      if (isExpertModeOn) {
        setShowExpertConfirm(true)
      } else if (isExpertModeOff) {
        updateSettingsState({ expertMode: false, showRecipient: false })
      } else {
        updateSettingsState(state)
      }
    },
    [settingsState, updateSettingsState]
  )
  const onEnableExpertMode = useCallback(() => {
    updateSettingsState({ expertMode: true, showRecipient: true })
    setShowExpertConfirm(false)
  }, [updateSettingsState, setShowExpertConfirm])

  return (
    <>
      <Menu>
        <styledEl.SettingsButton>
          <styledEl.SettingsIcon />
          {settingsState.expertMode && (
            <styledEl.ExpertModeIndicator>
              <span>🐮</span>
              <span>🥋</span>
            </styledEl.ExpertModeIndicator>
          )}
        </styledEl.SettingsButton>
        <styledEl.MenuContent>
          <MenuItem disabled={true} onSelect={() => void 0}>
            <Settings state={settingsState} onStateChanged={onStateChanged} />
          </MenuItem>
        </styledEl.MenuContent>
      </Menu>
      <ExpertModeModal
        isOpen={showExpertConfirm}
        onDismiss={() => setShowExpertConfirm(false)}
        onEnable={onEnableExpertMode}
      />
    </>
  )
}
