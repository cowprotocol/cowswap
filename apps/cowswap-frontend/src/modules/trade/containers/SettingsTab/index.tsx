import { useCallback } from 'react'

import { StatefulValue } from '@cowprotocol/types'
import { HelpTooltip, RowBetween, RowFixed } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { Menu } from '@reach/menu-button'
import { Text } from 'rebass'
import { ThemedText } from 'theme'

import { AutoColumn } from 'legacy/components/Column'
import { Toggle } from 'legacy/components/Toggle'

import { toggleRecipientAddressAnalytics } from 'modules/analytics'
import { SettingsIcon } from 'modules/trade/pure/Settings'

import * as styledEl from './styled'

import { TransactionSettings } from '../TransactionSettings'

interface SettingsTabProps {
  className?: string
  recipientToggleState: StatefulValue<boolean>
  deadlineState: StatefulValue<number>
}

export function SettingsTab({ className, recipientToggleState, deadlineState }: SettingsTabProps) {
  const [recipientToggleVisible, toggleRecipientVisibilityAux] = recipientToggleState
  const toggleRecipientVisibility = useCallback(
    (value?: boolean) => {
      const isVisible = value ?? !recipientToggleVisible
      toggleRecipientAddressAnalytics(isVisible)
      toggleRecipientVisibilityAux(isVisible)
    },
    [toggleRecipientVisibilityAux, recipientToggleVisible],
  )

  return (
    <Menu>
      <styledEl.StyledMenu className={className}>
        <styledEl.StyledMenuButton id="open-settings-dialog-button">
          <SettingsIcon />
        </styledEl.StyledMenuButton>
        <styledEl.MenuFlyout portal={false}>
          <AutoColumn gap="md" style={{ padding: '1rem' }}>
            <Text fontWeight={600} fontSize={14}>
              <Trans>Transaction Settings</Trans>
            </Text>
            <TransactionSettings deadlineState={deadlineState} />
            <Text fontWeight={600} fontSize={14}>
              <Trans>Interface Settings</Trans>
            </Text>

            <RowBetween>
              <RowFixed>
                <ThemedText.Black fontWeight={400} fontSize={14}>
                  <Trans>Custom Recipient</Trans>
                </ThemedText.Black>
                <HelpTooltip
                  text={
                    <Trans>Allows you to choose a destination address for the swap other than the connected one.</Trans>
                  }
                />
              </RowFixed>
              <Toggle
                id="toggle-recipient-mode-button"
                isActive={recipientToggleVisible}
                toggle={toggleRecipientVisibility}
              />
            </RowBetween>
          </AutoColumn>
        </styledEl.MenuFlyout>
      </styledEl.StyledMenu>
    </Menu>
  )
}
