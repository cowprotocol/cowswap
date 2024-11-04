import { useAtom } from 'jotai'
import { ReactElement, RefObject, useCallback, useEffect, useRef } from 'react'

import { StatefulValue } from '@cowprotocol/types'
import { HelpTooltip, RowBetween, RowFixed } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { Menu, useMenuButtonContext } from '@reach/menu-button'
import { Text } from 'rebass'
import { ThemedText } from 'theme'

import { AutoColumn } from 'legacy/components/Column'
import { Toggle } from 'legacy/components/Toggle'

import { toggleRecipientAddressAnalytics } from 'modules/analytics'
import { SettingsIcon } from 'modules/trade/pure/Settings'

import * as styledEl from './styled'

import { settingsTabStateAtom } from '../../state/settingsTabState'
import { TransactionSettings } from '../TransactionSettings'

interface SettingsTabProps {
  className?: string
  recipientToggleState: StatefulValue<boolean>
  deadlineState: StatefulValue<number>
}

export function SettingsTab({ className, recipientToggleState, deadlineState }: SettingsTabProps) {
  const menuButtonRef = useRef<HTMLButtonElement>(null)

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
      <SettingsTabController buttonRef={menuButtonRef}>
        <styledEl.StyledMenu className={className}>
          <styledEl.StyledMenuButton ref={menuButtonRef} id="open-settings-dialog-button">
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
                      <Trans>
                        Allows you to choose a destination address for the swap other than the connected one.
                      </Trans>
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
      </SettingsTabController>
    </Menu>
  )
}

interface SettingsTabControllerProps {
  buttonRef: RefObject<HTMLButtonElement>
  children: ReactElement
}

/**
 * https://stackoverflow.com/questions/70596487/how-to-programmatically-expand-react-reach-ui-reach-menu-button-menu
 */
function SettingsTabController({ buttonRef, children }: SettingsTabControllerProps) {
  const [settingsTabState, setSettingsTabState] = useAtom(settingsTabStateAtom)
  const { isExpanded } = useMenuButtonContext()

  const toggleMenu = useCallback(() => {
    buttonRef.current?.dispatchEvent(new Event('mousedown', { bubbles: true }))
  }, [buttonRef])

  useEffect(() => {
    if (settingsTabState.open) {
      toggleMenu()
    }
  }, [settingsTabState.open, toggleMenu])

  useEffect(() => {
    if (settingsTabState.open && !isExpanded) {
      toggleMenu()
      setSettingsTabState({ open: false })
    }
  }, [settingsTabState.open, isExpanded, toggleMenu, setSettingsTabState])

  return children
}
