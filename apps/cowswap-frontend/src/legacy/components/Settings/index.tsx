import { useCallback, useRef } from 'react'

import { useOnClickOutside } from '@cowprotocol/common-hooks'
import { StatefulValue } from '@cowprotocol/types'
import { HelpTooltip, RowBetween, RowFixed } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { Text } from 'rebass'
import { ThemedText } from 'theme'

import { AutoColumn } from 'legacy/components/Column'
import { Toggle } from 'legacy/components/Toggle'
import { TransactionSettings } from 'legacy/components/TransactionSettings'
import { useModalIsOpen, useToggleSettingsMenu } from 'legacy/state/application/hooks'
import { ApplicationModal } from 'legacy/state/application/reducer'

import { toggleRecipientAddressAnalytics } from 'modules/analytics'
import { SettingsIcon } from 'modules/trade/pure/Settings'

import * as styledEl from './styled'

interface SettingsTabProps {
  className?: string
  recipientToggleState: StatefulValue<boolean>
  deadlineState: StatefulValue<number>
}

export function SettingsTab({ className, recipientToggleState, deadlineState }: SettingsTabProps) {
  const node = useRef<HTMLDivElement>(null)
  const open = useModalIsOpen(ApplicationModal.SETTINGS)
  const toggle = useToggleSettingsMenu()

  const [recipientToggleVisible, toggleRecipientVisibilityAux] = recipientToggleState
  const toggleRecipientVisibility = useCallback(
    (value?: boolean) => {
      const isVisible = value ?? !recipientToggleVisible
      toggleRecipientAddressAnalytics(isVisible)
      toggleRecipientVisibilityAux(isVisible)
    },
    [toggleRecipientVisibilityAux, recipientToggleVisible],
  )

  useOnClickOutside([node], open ? toggle : undefined)

  return (
    <styledEl.StyledMenu ref={node} className={className}>
      <styledEl.StyledMenuButton onClick={toggle} id="open-settings-dialog-button">
        <SettingsIcon />
      </styledEl.StyledMenuButton>
      {open && (
        <styledEl.MenuFlyout>
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
      )}
    </styledEl.StyledMenu>
  )
}
