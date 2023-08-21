import { AdvancedOrdersSettingsState } from 'modules/advancedOrders/state/advancedOrdersSettingsAtom'
import { SettingsBox, SettingsContainer, SettingsTitle } from 'modules/trade/pure/Settings'

export interface SettingsProps {
  state: AdvancedOrdersSettingsState
  onStateChanged: (state: Partial<AdvancedOrdersSettingsState>) => void
}

export function Settings({ state, onStateChanged }: SettingsProps) {
  const { showRecipient } = state

  return (
    <SettingsContainer>
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
