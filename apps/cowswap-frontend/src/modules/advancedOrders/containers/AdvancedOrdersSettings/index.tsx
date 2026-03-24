import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode, useCallback, useRef, useState } from 'react'

import { Media, Dropdown } from '@cowprotocol/ui'

import { AdvancedOrdersSettingsDropdown } from 'modules/advancedOrders/pure/Settings/AdvancedOrdersSettings'
import { ButtonsContainer, SettingsButton, SettingsIcon } from 'modules/trade/pure/Settings'

import { useIsProviderNetworkDeprecated } from 'common/hooks/useIsProviderNetworkDeprecated'
import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { useUpdateAdvancedOrdersRawState } from '../../hooks/useAdvancedOrdersRawState'
import {
  advancedOrdersSettingsAtom,
  AdvancedOrdersSettingsState,
  updateAdvancedOrdersSettingsAtom,
} from '../../state/advancedOrdersSettingsAtom'

export function AdvancedOrdersSettings(): ReactNode {
  const settingsState = useAtomValue(advancedOrdersSettingsAtom)
  const updateSettingsState = useSetAtom(updateAdvancedOrdersSettingsAtom)
  const updateAdvancedOrdersRawState = useUpdateAdvancedOrdersRawState()
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()
  const isProviderNetworkDeprecated = useIsProviderNetworkDeprecated()
  const isSettingsDisabled = isProviderNetworkUnsupported || isProviderNetworkDeprecated
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const handleDismiss = useCallback(() => {
    console.log('handleDismiss')
    setIsOpen(false)
  }, [setIsOpen])

  const onStateChanged = useCallback(
    (state: Partial<AdvancedOrdersSettingsState>) => {
      updateSettingsState(state)
      if (state.showRecipient === false) {
        updateAdvancedOrdersRawState({ recipient: undefined, recipientAddress: undefined })
      }
    },
    [updateSettingsState, updateAdvancedOrdersRawState],
  )

  return (
    <ButtonsContainer>
      <SettingsButton ref={buttonRef} disabled={isSettingsDisabled} onClick={() => setIsOpen((open) => !open)}>
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
        <AdvancedOrdersSettingsDropdown state={settingsState} onStateChanged={onStateChanged} />
      </Dropdown>
    </ButtonsContainer>
  )
}
