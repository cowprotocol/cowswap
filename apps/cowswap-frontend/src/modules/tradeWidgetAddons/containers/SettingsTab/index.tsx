import { useAtom } from 'jotai'
import { ReactElement, RefObject, useCallback, useEffect, useRef } from 'react'

import EXPERIMENT_ICON from '@cowprotocol/assets/cow-swap/experiment.svg'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { StatefulValue } from '@cowprotocol/types'
import { HelpTooltip, RowBetween, RowFixed } from '@cowprotocol/ui'

import { Trans } from '@lingui/macro'
import { Menu, useMenuButtonContext } from '@reach/menu-button'
import SVG from 'react-inlinesvg'
import { Text } from 'rebass'
import { ThemedText } from 'theme'

import { AutoColumn } from 'legacy/components/Column'
import { Toggle } from 'legacy/components/Toggle'

import { SettingsIcon } from 'modules/trade/pure/Settings'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'

import * as styledEl from './styled'

import { settingsTabStateAtom } from '../../state/settingsTabState'
import { TransactionSettings } from '../TransactionSettings'

interface SettingsTabProps {
  className?: string
  recipientToggleState: StatefulValue<boolean>
  hooksEnabledState?: StatefulValue<boolean>
  deadlineState: StatefulValue<number>
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation
// eslint-disable-next-line max-lines-per-function, @typescript-eslint/explicit-function-return-type
export function SettingsTab({ className, recipientToggleState, hooksEnabledState, deadlineState }: SettingsTabProps) {
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  const [recipientToggleVisible, toggleRecipientVisibilityAux] = recipientToggleState
  const toggleRecipientVisibility = useCallback(
    (value?: boolean) => {
      const isVisible = value ?? !recipientToggleVisible
      toggleRecipientVisibilityAux(isVisible)
    },
    [toggleRecipientVisibilityAux, recipientToggleVisible],
  )

  const [hooksEnabled, toggleHooksEnabledAux] = hooksEnabledState || [null, null]
  const toggleHooksEnabled = useCallback(
    (value?: boolean) => {
      if (hooksEnabled === null || toggleHooksEnabledAux === null) return

      const isEnabled = value ?? !hooksEnabled
      toggleHooksEnabledAux(isEnabled)
    },
    [hooksEnabled, toggleHooksEnabledAux],
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
                  data-click-event={toCowSwapGtmEvent({
                    category: CowSwapAnalyticsCategory.RECIPIENT_ADDRESS,
                    action: 'Toggle Recipient Address',
                    label: recipientToggleVisible ? 'Enabled' : 'Disabled',
                  })}
                />
              </RowBetween>

              {!isInjectedWidget() && hooksEnabled !== null && (
                <RowBetween>
                  <RowFixed>
                    <ThemedText.Black fontWeight={400} fontSize={14}>
                      <Trans>Enable Hooks</Trans>
                    </ThemedText.Black>
                    <HelpTooltip
                      text={
                        <Trans>
                          <b>
                            <SVG src={EXPERIMENT_ICON} width={12} height={12} /> Experimental:
                          </b>{' '}
                          Add DeFI interactions before and after your trade.
                        </Trans>
                      }
                    />
                  </RowFixed>
                  <Toggle
                    id="toggle-hooks-mode-button"
                    isActive={hooksEnabled}
                    toggle={toggleHooksEnabled}
                    data-click-event={toCowSwapGtmEvent({
                      category: CowSwapAnalyticsCategory.HOOKS,
                      action: 'Toggle Hooks Enabled',
                      label: hooksEnabled ? 'Enabled' : 'Disabled',
                    })}
                  />
                </RowBetween>
              )}
            </AutoColumn>
          </styledEl.MenuFlyout>
        </styledEl.StyledMenu>
      </SettingsTabController>
    </Menu>
  )
}

interface SettingsTabControllerProps {
  buttonRef: RefObject<HTMLButtonElement | null>
  children: ReactElement
}

/**
 * https://stackoverflow.com/questions/70596487/how-to-programmatically-expand-react-reach-ui-reach-menu-button-menu
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
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
