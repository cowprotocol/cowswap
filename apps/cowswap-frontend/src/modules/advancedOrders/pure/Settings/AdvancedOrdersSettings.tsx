import { useAtomValue, useSetAtom } from 'jotai'
import { ReactNode } from 'react'

import { SettingsDropdownSection, SettingsBox } from '@cowprotocol/ui'

import { t } from '@lingui/core/macro'
import { useLingui } from '@lingui/react/macro'

import {
  limitOrdersSettingsAtom,
  updateLimitOrdersSettingsAtom,
} from 'modules/limitOrders/state/limitOrdersSettingsAtom'
import { getOrdersTableSettings } from 'modules/trade/const/common'
import { SettingsContainer } from 'modules/trade/pure/Settings'

import { AdvancedOrdersSettingsState } from '../../state/advancedOrdersSettingsAtom'

export interface SettingsProps {
  state: AdvancedOrdersSettingsState
  onStateChanged: (state: Partial<AdvancedOrdersSettingsState>) => void
}

export function AdvancedOrdersSettingsDropdown({ state, onStateChanged }: SettingsProps): ReactNode {
  const { showRecipient } = state
  // TODO: we should use limit orders settings in Advanced Orders!
  const limitOrdersSettings = useAtomValue(limitOrdersSettingsAtom)
  const updateLimitOrdersSettings = useSetAtom(updateLimitOrdersSettingsAtom)
  const { LEFT_ALIGNED } = getOrdersTableSettings()
  const { i18n } = useLingui()

  return (
    <SettingsContainer>
      <SettingsDropdownSection title={t`TWAP Settings`}>
        <SettingsBox
          title={t`Custom Recipient`}
          tooltip={t`Allows you to choose a destination address for the swap other than the connected one.`}
          checked={showRecipient}
          toggle={() => onStateChanged({ showRecipient: !showRecipient })}
        />
      </SettingsDropdownSection>

      <SettingsDropdownSection title={t`TWAP Interface`}>
        <SettingsBox
          title={i18n._(LEFT_ALIGNED.title)}
          tooltip={i18n._(LEFT_ALIGNED.tooltip)}
          checked={limitOrdersSettings.ordersTableOnLeft}
          toggle={() => updateLimitOrdersSettings({ ordersTableOnLeft: !limitOrdersSettings.ordersTableOnLeft })}
        />
      </SettingsDropdownSection>
    </SettingsContainer>
  )
}
