import { useAtomValue, useSetAtom } from 'jotai'

import { t } from '@lingui/core/macro'
import { Trans, useLingui } from '@lingui/react/macro'

import {
  limitOrdersSettingsAtom,
  updateLimitOrdersSettingsAtom,
} from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { getOrdersTableSettings } from 'modules/trade/const/common'
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
  const { LEFT_ALIGNED } = getOrdersTableSettings()
  const { i18n } = useLingui()

  return (
    <SettingsContainer>
      <SettingsTitle>
        <Trans>Advanced Order Settings</Trans>
      </SettingsTitle>
      <SettingsBox
        title={t`Custom Recipient`}
        tooltip={t`Allows you to choose a destination address for the swap other than the connected one.`}
        value={showRecipient}
        toggle={() => onStateChanged({ showRecipient: !showRecipient })}
      />
      <SettingsBox
        title={i18n._(LEFT_ALIGNED.title)}
        tooltip={i18n._(LEFT_ALIGNED.tooltip)}
        value={limitOrdersSettings.ordersTableOnLeft}
        toggle={() => updateLimitOrdersSettings({ ordersTableOnLeft: !limitOrdersSettings.ordersTableOnLeft })}
      />
    </SettingsContainer>
  )
}
