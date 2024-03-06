import { SettingsBox, SettingsContainer, SettingsTitle } from 'modules/trade/pure/Settings'

import { LimitOrdersSettingsState } from '../../state/limitOrdersSettingsAtom'

export interface SettingsProps {
  state: LimitOrdersSettingsState
  onStateChanged: (state: Partial<LimitOrdersSettingsState>) => void
}

export function Settings({ state, onStateChanged }: SettingsProps) {
  const { showRecipient, partialFillsEnabled } = state

  return (
    <SettingsContainer>
      <SettingsTitle>Interface Settings</SettingsTitle>

      <SettingsBox
        title="Custom Recipient"
        tooltip="Allows you to choose a destination address for the swap other than the connected one."
        value={showRecipient}
        toggle={() => onStateChanged({ showRecipient: !showRecipient })}
      />

      <SettingsBox
        title="Enable Partial Executions"
        tooltip={
          <>
            Allow you to chose whether your limit orders will be <i>Partially fillable</i> or <i>Fill or kill</i>.
            <br />
            <br />
            <i>Fill or kill</i> orders will either be filled fully or not at all.
            <br />
            <i>Partially fillable</i> orders may be filled partially if there isn't enough liquidity to fill the full
            amount.
          </>
        }
        value={partialFillsEnabled}
        toggle={() => onStateChanged({ partialFillsEnabled: !partialFillsEnabled })}
      />
    </SettingsContainer>
  )
}
