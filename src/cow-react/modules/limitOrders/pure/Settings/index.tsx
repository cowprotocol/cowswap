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
        <QuestionHelper bgColor={theme.bg3} color={theme.text1} text={<Trans>{tooltip}</Trans>} />
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
  const expertModeControl: SettingsBoxProps = {
    title: 'Expert Mode',
    tooltip: 'Allow high price impact trades and skip the confirm screen. Use at your own risk.',
    value: expertMode,
    toggle() {
      onStateChanged({ expertMode: !expertMode })
    },
  }

  const showRecipientControl: SettingsBoxProps = {
    title: 'Toggle Recipient',
    tooltip: 'Allows you to choose a destination address for the swap other than the connected one.',
    value: showRecipient,
    disabled: expertMode,
    toggle() {
      onStateChanged({ showRecipient: !showRecipient })
    },
  }

  return (
    <styledEl.SettingsContainer>
      <styledEl.SettingsTitle>Interface Settings</styledEl.SettingsTitle>
      <SettingsBox {...expertModeControl} />
      <SettingsBox {...showRecipientControl} />
    </styledEl.SettingsContainer>
  )
}
