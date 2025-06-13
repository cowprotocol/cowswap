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

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function Settings({ state, onStateChanged }: SettingsProps) {
  const { showRecipient } = state
  // TODO: we should use limit orders settings in Advanced Orders!
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
