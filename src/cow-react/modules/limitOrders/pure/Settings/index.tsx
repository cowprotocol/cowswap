import { Trans } from '@lingui/macro'
import QuestionHelper from 'components/QuestionHelper'
import { useContext } from 'react'
import { ThemeContext } from 'styled-components/macro'
import Toggle from 'components/Toggle'
import * as styledEl from './styled'
import { LimitOrdersSettingsState } from '../../state/limitOrdersSettingsAtom'

interface SettingsBoxProps {
  title: string
  tooltip: string
  value: boolean
  disabled?: boolean
  toggle: () => void
}

function SettingsBox({ title, tooltip, value, toggle, disabled = false }: SettingsBoxProps) {
  const theme = useContext(ThemeContext)

  return (
    <styledEl.SettingsBox disabled={disabled}>
      <styledEl.SettingsBoxTitle>
        <Trans>{title}</Trans>
        <QuestionHelper bgColor={theme.grey1} color={theme.text1} text={<Trans>{tooltip}</Trans>} />
      </styledEl.SettingsBoxTitle>
      <Toggle isActive={value} toggle={toggle} />
    </styledEl.SettingsBox>
  )
}

export interface SettingsProps {
  state: LimitOrdersSettingsState
  onStateChanged: (state: Partial<LimitOrdersSettingsState>) => void
}

export function Settings({ state, onStateChanged }: SettingsProps) {
  const { expertMode, showRecipient } = state

  return (
    <styledEl.SettingsContainer>
      <styledEl.SettingsTitle>Interface Settings</styledEl.SettingsTitle>
      <SettingsBox
        title="Expert Mode"
        tooltip="Allow high price impact trades and skip the confirm screen. Use at your own risk."
        value={expertMode}
        toggle={() => onStateChanged({ expertMode: !expertMode })}
      />

      <SettingsBox
        title="Custom Recipient"
        tooltip="Allows you to choose a destination address for the swap other than the connected one."
        value={showRecipient}
        toggle={() => onStateChanged({ showRecipient: !showRecipient })}
      />
    </styledEl.SettingsContainer>
  )
}
