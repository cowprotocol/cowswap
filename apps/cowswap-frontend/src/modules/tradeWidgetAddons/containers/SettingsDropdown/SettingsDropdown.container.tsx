import { useAtom } from 'jotai'
import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import EXPERIMENT_ICON from '@cowprotocol/assets/cow-swap/experiment.svg'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { StatefulValue } from '@cowprotocol/types'
import { Dropdown, Media, SettingsBox, SettingsBoxGroup, SettingsDropdownSection } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import SVG from 'react-inlinesvg'

import { SettingsIcon } from 'modules/trade/pure/Settings'
import { DeadlineTransactionSettings } from 'modules/tradeWidgetAddons/containers/DeadlineTransactionSettings/DeadlineTransactionSettings.container'
import { TransactionSlippageInput } from 'modules/tradeWidgetAddons/containers/TransactionSlippageInput/TransactionSlippageInput.container'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import * as styledEl from './SettingsDropdown.styled'

import { settingsTabStateAtom } from '../../state/settingsTabState'

interface SettingsTabProps {
  className?: string
  recipientToggleState: StatefulValue<boolean>
  hooksEnabledState?: StatefulValue<boolean>
  deadlineState: StatefulValue<number>
  enablePartialApprovalState?: StatefulValue<boolean> | [null, null]
}

// eslint-disable-next-line max-lines-per-function
export function SettingsDropdown({
  className,
  recipientToggleState,
  hooksEnabledState,
  deadlineState,
  enablePartialApprovalState,
}: SettingsTabProps): ReactNode {
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [settingsTabState, setSettingsTabState] = useAtom(settingsTabStateAtom)
  const hasRequestedOpen = useRef(false)

  const handleDismiss = useCallback(() => {
    console.log('handleDismiss')
    setMenuOpen(false)
    setSettingsTabState({ open: false })
  }, [setMenuOpen, setSettingsTabState])

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

  const [enablePartialApproval, toggleEnablePartialApprovalAux] = enablePartialApprovalState || [null, null]
  const toggleEnablePartialApproval = useCallback(
    (value?: boolean) => {
      if (enablePartialApproval === null || toggleEnablePartialApprovalAux === null) return

      const isEnabled = value ?? !enablePartialApproval
      toggleEnablePartialApprovalAux(isEnabled)
    },
    [toggleEnablePartialApprovalAux, enablePartialApproval],
  )

  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const isSettingsDisabled = isProviderNetworkUnsupported || isProviderNetworkDeprecated

  /**
   * Opens settings when `settingsTabState.open` is set (e.g. from slippage row "Edit"),
   * then clears the flag once the panel is open.
   */
  useEffect(() => {
    if (!settingsTabState.open) {
      hasRequestedOpen.current = false
      return
    }
    if (menuOpen) {
      setSettingsTabState({ open: false })
      hasRequestedOpen.current = false
      return
    }
    if (!hasRequestedOpen.current) {
      hasRequestedOpen.current = true
      setMenuOpen(true)
    }
  }, [settingsTabState.open, menuOpen, setSettingsTabState])

  return (
    <>
      <styledEl.StyledMenu className={className}>
        <styledEl.StyledMenuButton
          ref={menuButtonRef}
          id="open-settings-dialog-button"
          disabled={isSettingsDisabled}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <SettingsIcon />
        </styledEl.StyledMenuButton>
      </styledEl.StyledMenu>

      {menuOpen && (
        <div
          id="testBox"
          style={{
            position: 'absolute',
            inset: 0,
            left: 0,
            right: 0,
            padding: '48px 10px 10px',
            width: 'auto',
            maxHeight: '100%',
            background: 'rgba(0, 0, 0, .25)',
            zIndex: 1000,
            // pointerEvents: "none",
          }}
        ></div>
      )}

      <Dropdown
        isOpen={menuOpen}
        onDismiss={handleDismiss}
        containerId="testBox"
        drawerMediaQuery={Media.upToSmall(false)}
        placement="bottom-end"
        showBackdrop={false}
      >
        <SettingsDropdownSection title={t`Swap Settings`}>
          <TransactionSlippageInput />
          <DeadlineTransactionSettings deadlineState={deadlineState} />
        </SettingsDropdownSection>

        <SettingsDropdownSection title={t`Swap Interface`}>
          <SettingsBoxGroup>
            <SettingsBox
              id="toggle-recipient-mode-button"
              title={t`Custom Recipient`}
              tooltip={t`Allows you to choose a destination address for the swap other than the connected one.`}
              checked={recipientToggleVisible}
              toggle={toggleRecipientVisibility}
              data-click-event={toCowSwapGtmEvent({
                category: CowSwapAnalyticsCategory.RECIPIENT_ADDRESS,
                action: 'Toggle Recipient Address',
                label: recipientToggleVisible ? 'Enabled' : 'Disabled',
              })}
            />

            {enablePartialApproval !== null ? (
              <SettingsBox
                id="enable-partial-approvals-button"
                title={t`Enable partial approvals`}
                tooltip={t`Allows you to set partial token approvals instead of full approvals.`}
                checked={enablePartialApproval}
                toggle={toggleEnablePartialApproval}
              />
            ) : null}

            {!isInjectedWidget() && hooksEnabled !== null ? (
              <SettingsBox
                id="toggle-hooks-mode-button"
                title={t`Enable Hooks`}
                tooltip={
                  <Trans>
                    <b>
                      <SVG src={EXPERIMENT_ICON} width={12} height={12} /> Experimental:
                    </b>{' '}
                    Add DeFi interactions before and after your trade.
                  </Trans>
                }
                checked={hooksEnabled}
                toggle={toggleHooksEnabled}
                data-click-event={toCowSwapGtmEvent({
                  category: CowSwapAnalyticsCategory.HOOKS,
                  action: 'Toggle Hooks Enabled',
                  label: hooksEnabled ? 'Enabled' : 'Disabled',
                })}
              />
            ) : null}
          </SettingsBoxGroup>
        </SettingsDropdownSection>
      </Dropdown>
    </>
  )
}
