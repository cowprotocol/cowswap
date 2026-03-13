import { useAtom } from 'jotai'
import { ReactElement, ReactNode, RefObject, useCallback, useEffect, useRef } from 'react'

import EXPERIMENT_ICON from '@cowprotocol/assets/cow-swap/experiment.svg'
import { isInjectedWidget } from '@cowprotocol/common-utils'
import { StatefulValue } from '@cowprotocol/types'
import { SettingsBox, SettingsDropdownSection } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { Trans } from '@lingui/react/macro'
import { Menu, useMenuButtonContext } from '@reach/menu-button'
import SVG from 'react-inlinesvg'

import { SettingsIcon } from 'modules/trade/pure/Settings'

import { CowSwapAnalyticsCategory, toCowSwapGtmEvent } from 'common/analytics/types'
import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import * as styledEl from './SettingsDropdown.styled'

import { TransactionSettings } from '../../pure/TransactionSettings/TransactionSettings.container'
import { settingsTabStateAtom } from '../../state/settingsTabState'

interface SettingsTabControllerProps {
  buttonRef: RefObject<HTMLButtonElement | null>
  children: ReactElement
}

interface SettingsTabProps {
  className?: string
  recipientToggleState: StatefulValue<boolean>
  hooksEnabledState?: StatefulValue<boolean>
  deadlineState: StatefulValue<number>
  enablePartialApprovalState?: StatefulValue<boolean> | [null, null]
}

// TODO: Break down this large function into smaller functions
// TODO: Add proper return type annotation

export function SettingsDropdown({
  className,
  recipientToggleState,
  hooksEnabledState,
  deadlineState,
  enablePartialApprovalState,
}: SettingsTabProps): ReactNode {
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

  return (
    <Menu>
      <SettingsTabController buttonRef={menuButtonRef}>
        <styledEl.StyledMenu className={className}>
          <styledEl.StyledMenuButton ref={menuButtonRef} id="open-settings-dialog-button" disabled={isSettingsDisabled}>
            <SettingsIcon />
          </styledEl.StyledMenuButton>
          <styledEl.MenuFlyout portal={false}>
            <SettingsDropdownSection title={t`Swap Settings`}>
              <TransactionSettings deadlineState={deadlineState} />
            </SettingsDropdownSection>

            <SettingsDropdownSection title={t`Swap Interface`}>
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
                      Add DeFI interactions before and after your trade.
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
            </SettingsDropdownSection>
          </styledEl.MenuFlyout>
        </styledEl.StyledMenu>
      </SettingsTabController>
    </Menu>
  )
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
