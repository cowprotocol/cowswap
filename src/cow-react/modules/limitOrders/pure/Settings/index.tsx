import { Trans } from '@lingui/macro'
import QuestionHelper from 'components/QuestionHelper'
import { useContext, useEffect } from 'react'
import { ThemeContext } from 'styled-components/macro'
import Toggle from 'components/Toggle'
import * as styledEl from './styled'
import { LimitOrdersSettingsState } from '../../state/limitOrdersSettingsAtom'
import useToggle from 'hooks/useToggle'

interface SettingsBoxProps {
  title: string
  tooltip: string
  value: boolean
  toggle: () => void
}

function SettingsBox({ title, tooltip, value, toggle }: SettingsBoxProps) {
  const theme = useContext(ThemeContext)

  return (
    <styledEl.SettingsBox>
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
  onStateChanged: (state: LimitOrdersSettingsState) => void
}

export function Settings({ state, onStateChanged }: SettingsProps) {
  const [expertMode, toggleExpertMode] = useToggle(state.expertMode)
  const [showRecipient, toggleShowRecipient] = useToggle(state.showRecipient)

  useEffect(() => {
    onStateChanged({ expertMode, showRecipient })
  }, [onStateChanged, expertMode, showRecipient])

  const expertModeControl: SettingsBoxProps = {
    title: 'Expert Mode',
    tooltip: 'Allow high price impact trades and skip the confirm screen. Use at your own risk.',
    value: expertMode,
    toggle: toggleExpertMode,
  }

  const showRecipientControl: SettingsBoxProps = {
    title: 'Toggle Recipient',
    tooltip: 'Allows you to choose a destination address for the swap other than the connected one.',
    value: showRecipient,
    toggle: toggleShowRecipient,
  }

  return (
    <div>
      <h3>Interface Settings</h3>
      <SettingsBox {...expertModeControl}></SettingsBox>
      <SettingsBox {...showRecipientControl}></SettingsBox>
    </div>
  )
}
