import { ReactNode, useContext } from 'react'

import { Trans } from '@lingui/macro'
import { ThemeContext } from 'styled-components/macro'

import QuestionHelper from 'legacy/components/QuestionHelper'
import Toggle from 'legacy/components/Toggle'

import { SettingsBoxTitle, SettingsBoxWrapper } from './styled'

interface SettingsBoxProps {
  title: string
  tooltip: ReactNode
  value: boolean
  disabled?: boolean
  toggle: () => void
}

export function SettingsBox({ title, tooltip, value, toggle, disabled = false }: SettingsBoxProps) {
  const theme = useContext(ThemeContext)

  return (
    <SettingsBoxWrapper disabled={disabled}>
      <SettingsBoxTitle>
        <Trans>{title}</Trans>
        <QuestionHelper bgColor={theme.grey1} color={theme.text1} text={<Trans>{tooltip}</Trans>} />
      </SettingsBoxTitle>
      <Toggle isActive={value} toggle={toggle} />
    </SettingsBoxWrapper>
  )
}
