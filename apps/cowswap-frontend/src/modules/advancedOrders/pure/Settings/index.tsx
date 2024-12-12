import { useAtomValue, useSetAtom } from 'jotai'

import {
  limitOrdersSettingsAtom,
  updateLimitOrdersSettingsAtom,
} from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { ORDERS_TABLE_SETTINGS } from 'modules/trade/const/common'
import { SettingsBox, SettingsContainer, SettingsTitle } from 'modules/trade/pure/Settings'

import { AdvancedOrdersSettingsState } from '../../state/advancedOrdersSettingsAtom'

export interface SettingsProps {
  state: AdvancedOrdersSettingsState
  onStateChanged: (state: Partial<AdvancedOrdersSettingsState>) => void
}

export function Settings({ state, onStateChanged }: SettingsProps) {
  const { showRecipient } = state
  const limitOrdersSettings = useAtomValue(limitOrdersSettingsAtom)
  const updateLimitOrdersSettings = useSetAtom(updateLimitOrdersSettingsAtom)

  return (
    <SettingsContainer>
      <SettingsTitle>Advanced Order Settings</SettingsTitle>

      <SettingsBox
        title="Custom Recipient"
        tooltip="Allows you to choose a destination address for the swap other than the connected one."
        value={showRecipient}
        toggle={() => onStateChanged({ showRecipient: !showRecipient })}
      />

      <SettingsBox
        title={ORDERS_TABLE_SETTINGS.LEFT_ALIGNED.title}
        tooltip={ORDERS_TABLE_SETTINGS.LEFT_ALIGNED.tooltip}
        value={limitOrdersSettings.ordersTableOnLeft}
        toggle={() => updateLimitOrdersSettings({ ordersTableOnLeft: !limitOrdersSettings.ordersTableOnLeft })}
      />
    </SettingsContainer>
  )
}
