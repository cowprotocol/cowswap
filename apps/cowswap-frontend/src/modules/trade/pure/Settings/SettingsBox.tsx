import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'

import { Trans } from '@lingui/macro'

import QuestionTooltip from 'legacy/components/QuestionHelper'
import { Toggle } from 'legacy/components/Toggle'

import { SettingsBoxTitle, SettingsBoxWrapper } from './styled'

interface SettingsBoxProps {
  title: string
  tooltip: ReactNode
  value: boolean
  disabled?: boolean
  toggle: Command
}

export function SettingsBox({ title, tooltip, value, toggle, disabled = false }: SettingsBoxProps) {
  return (
    <SettingsBoxWrapper disabled={disabled}>
      <SettingsBoxTitle>
        <Trans>{title}</Trans>
        <QuestionTooltip text={<Trans>{tooltip}</Trans>} />
      </SettingsBoxTitle>
      <Toggle isActive={value} toggle={toggle} />
    </SettingsBoxWrapper>
  )
}
