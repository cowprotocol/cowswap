import { useAtom } from 'jotai'
import { limitOrdersSettingsAtom, LimitOrdersSettingsState } from '../../state/limitOrdersSettingsAtom'
import { Settings } from '../../pure/Settings'
import { ExpertModeModal } from '@cow/common/pure/ExpertModeModal'
import React, { useCallback, useState } from 'react'
import { Trans } from '@lingui/macro'
import { Dropdown } from '@cow/common/pure/Dropdown'
import * as styledEl from './styled'

export function SettingsWidget() {
  const [settingsState, setSettingsState] = useAtom(limitOrdersSettingsAtom)
  const [showExpertConfirm, setShowExpertConfirm] = useState(false)

  const onStateChanged = useCallback(
    (state: LimitOrdersSettingsState) => {
      const isExpertModeOn = !settingsState.expertMode && state.expertMode
      const isExpertModeOff = settingsState.expertMode && !state.expertMode

      if (isExpertModeOn) {
        setShowExpertConfirm(true)
      } else if (isExpertModeOff) {
        setSettingsState({ expertMode: false, showRecipient: false })
      } else {
        setSettingsState(state)
      }
    },
    [settingsState, setSettingsState]
  )
  const onEnableExpertMode = useCallback(() => {
    setSettingsState({ expertMode: true, showRecipient: true })
    setShowExpertConfirm(false)
  }, [setSettingsState, setShowExpertConfirm])

  return (
    <>
      <Dropdown
        content={<Settings state={settingsState} onStateChanged={onStateChanged} />}
        ignoreOutsideClicks={showExpertConfirm}
      >
        <styledEl.SettingsButton>
          <styledEl.SettingsTitle>
            <Trans>Settings</Trans>
          </styledEl.SettingsTitle>
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
