import { useSetAtom } from 'jotai'
import {
  limitOrdersSettingsAtom,
  LimitOrdersSettingsState,
  updateLimitOrdersSettingsAtom,
} from '../../state/limitOrdersSettingsAtom'
import { Settings } from '../../pure/Settings'
import { ExpertModeModal } from '@cow/common/pure/ExpertModeModal'
import React, { useCallback, useState } from 'react'
import { Dropdown } from '@cow/common/pure/Dropdown'
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
      <Dropdown
        content={<Settings state={settingsState} onStateChanged={onStateChanged} />}
        ignoreOutsideClicks={showExpertConfirm}
      >
        <styledEl.SettingsButton>
          <styledEl.SettingsIcon />
          {settingsState.expertMode && (
            <styledEl.ExpertModeIndicator>
              <span>🐮</span>
              <span>🥋</span>
            </styledEl.ExpertModeIndicator>
          )}
        </styledEl.SettingsButton>
      </Dropdown>
      <ExpertModeModal
        isOpen={showExpertConfirm}
        onDismiss={() => setShowExpertConfirm(false)}
        onEnable={onEnableExpertMode}
      />
    </>
  )
}
