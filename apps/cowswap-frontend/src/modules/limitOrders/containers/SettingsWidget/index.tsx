import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback, useRef, useState } from 'react'

import { Media, Dropdown } from '@cowprotocol/ui'

import { ButtonsContainer, SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { useLimitOrderSettingsAnalytics } from '../../hooks/useLimitOrderSettingsAnalytics'
import { useUpdateLimitOrdersRawState } from '../../hooks/useLimitOrdersRawState'
import { LimitOrdersSettingsDropdown } from '../../pure/Settings/LimitOrdersSettings.pure'
import {
  limitOrdersSettingsAtom,
  LimitOrdersSettingsState,
  updateLimitOrdersSettingsAtom,
} from '../../state/limitOrdersSettingsAtom'

export function SettingsWidget(): ReactNode {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateLimitOrdersSettingsAtom)
  const analytics = useLimitOrderSettingsAnalytics()
  const updateLimitOrdersRawState = useUpdateLimitOrdersRawState()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const isSettingsDisabled = isProviderNetworkUnsupported || isProviderNetworkDeprecated
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleDismiss = useCallback(() => {
    console.log('handleDismiss')
    setIsOpen(false)
  }, [setIsOpen])

  const onSettingsChange = useCallback(
    (update: Partial<LimitOrdersSettingsState>) => {
      updateSettingsState(update)
      if (update.showRecipient === false) {
        updateLimitOrdersRawState({ recipient: undefined, recipientAddress: undefined })
      }
    },
    [updateSettingsState, updateLimitOrdersRawState],
  )

  console.log('isOpen', isOpen)

  return (
    <ButtonsContainer>
      <SettingsButton
        ref={buttonRef}
        disabled={isSettingsDisabled}
        onClick={() => {
          analytics.openSettings()
          setIsOpen((open) => !open)
        }}
      >
        <SettingsIcon />
      </SettingsButton>

      <Dropdown
        isOpen={isOpen}
        onDismiss={handleDismiss}
        anchorRef={buttonRef}
        drawerMediaQuery={Media.upToSmall(false)}
        placement="bottom-end"
        showBackdrop={false}
      >
        <LimitOrdersSettingsDropdown state={settingsState} onStateChanged={onSettingsChange} />
      </Dropdown>
    </ButtonsContainer>
  )
}
