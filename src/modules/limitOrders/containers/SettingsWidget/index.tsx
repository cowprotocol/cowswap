import { useSetAtom } from 'jotai'
import { useAtomValue } from 'jotai/utils'
import React, { useCallback, useState } from 'react'

import { Menu, MenuItem } from '@reach/menu-button'

import { ExpertModeIndicator, MenuContent, SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import { useFeatureFlags } from 'common/hooks/featureFlags/useFeatureFlags'
import { ExpertModeModal } from 'common/pure/ExpertModeModal'

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
        <SettingsButton>
          <SettingsIcon />
          {settingsState.expertMode && (
            <ExpertModeIndicator>
              <span>🐮</span>
              <span>🥋</span>
            </ExpertModeIndicator>
          )}
        </SettingsButton>
        <MenuContent>
          <MenuItem disabled={true} onSelect={() => void 0}>
            <Settings
              state={settingsState}
              onStateChanged={onStateChanged}
              featurePartialFillsEnabled={partialFillsEnabled}
            />
          </MenuItem>
        </MenuContent>
      </Menu>
      <ExpertModeModal
        isOpen={showExpertConfirm}
        onDismiss={() => setShowExpertConfirm(false)}
        onEnable={onEnableExpertMode}
      />
    </>
  )
}
