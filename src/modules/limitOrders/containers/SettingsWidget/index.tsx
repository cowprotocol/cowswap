import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import React, { useCallback, useState } from 'react'

import { Menu, MenuItem } from '@reach/menu-button'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'
import { ExpertModeModal } from 'common/pure/ExpertModeModal'

import * as styledEl from './styled'

import { Settings } from '../../pure/Settings'
import {
  limitOrdersSettingsAtom,
  LimitOrdersSettingsState,
  updateLimitOrdersSettingsAtom,
} from '../../state/limitOrdersSettingsAtom'

export function SettingsWidget() {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const [showExpertConfirm, setShowExpertConfirm] = useState(false)
  const { partialFillsEnabled } = useFeatureFlags()

  const onStateChanged = useCallback(
    (state: Partial<LimitOrdersSettingsState>) => {
      const { expertMode } = state

      if (expertMode !== undefined) {
        const isExpertModeOn = !settingsState.expertMode && expertMode
        const isExpertModeOff = settingsState.expertMode && !expertMode

        if (isExpertModeOn) {
          setShowExpertConfirm(true)
        } else if (isExpertModeOff) {
          updateSettingsState({ expertMode: false })
        }
      } else {
        updateSettingsState(state)
      }
    },
    [settingsState, updateSettingsState]
  )
  const onEnableExpertMode = useCallback(() => {
    updateSettingsState({ expertMode: true })
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
            <Settings
              state={settingsState}
              onStateChanged={onStateChanged}
              featurePartialFillsEnabled={partialFillsEnabled}
            />
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
