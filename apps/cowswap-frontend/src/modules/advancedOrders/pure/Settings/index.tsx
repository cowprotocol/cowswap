import { AdvancedOrdersSettingsState } from 'modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { SettingsBox, SettingsContainer, SettingsTitle } from 'modules/trade/pure/Settings'
import { ChangeNetworkWidget } from 'modules/tradeWidgetAddons/containers/SettingsTab'

export interface SettingsProps {
  state: AdvancedOrdersSettingsState
  onStateChanged: (state: Partial<AdvancedOrdersSettingsState>) => void
}

export function Settings({ state, onStateChanged }: SettingsProps) {
  const { showRecipient } = state

  return (
    <SettingsContainer>
      <ChangeNetworkWidget />
      <SettingsTitle>Interface Settings</SettingsTitle>

      <SettingsBox
        title="Custom Recipient"
        tooltip="Allows you to choose a destination address for the swap other than the connected one."
        value={showRecipient}
        toggle={() => onStateChanged({ showRecipient: !showRecipient })}
      />
    </SettingsContainer>
  )
}
