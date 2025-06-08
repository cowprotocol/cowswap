import { ReactNode } from 'react'

import { Command } from '@cowprotocol/types'
import { HelpTooltip } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'

import { Toggle } from 'legacy/components/Toggle'

import { SettingsBoxTitle, SettingsBoxWrapper } from './styled'

interface SettingsBoxProps {
  title: string
  tooltip: ReactNode
  value: boolean
  disabled?: boolean
  toggle: Command
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function SettingsBox({ title, tooltip, value, toggle, disabled = false }: SettingsBoxProps) {
  return (
    <SettingsBoxWrapper disabled={disabled}>
      <SettingsBoxTitle>
        <Trans>{title}</Trans>
        <HelpTooltip text={<Trans>{tooltip}</Trans>} />
      </SettingsBoxTitle>
      <Toggle isActive={value} toggle={toggle} />
    </SettingsBoxWrapper>
  )
}
