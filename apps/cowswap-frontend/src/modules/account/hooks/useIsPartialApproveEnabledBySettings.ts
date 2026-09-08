import { useAtomValue } from 'jotai'

import { UiOrderType } from '@cowprotocol/types'

import { Nullish } from 'types'

import { advancedOrdersSettingsAtom } from 'modules/advancedOrders'
import { limitOrdersSettingsAtom } from 'modules/limitOrders'
import { useSwapPartialApprovalToggleState } from 'modules/swap'

interface PartialApproveEnabledBySettings {
  swap: boolean
  limit: boolean
  twap: boolean
}

export function getIsPartialApproveEnabledBySettings(
  uiOrderType: Nullish<UiOrderType>,
  settings: PartialApproveEnabledBySettings,
): boolean {
  switch (uiOrderType) {
    case UiOrderType.LIMIT:
      return settings.limit
    case UiOrderType.TWAP:
      return settings.twap
    case UiOrderType.SWAP:
    case UiOrderType.HOOKS:
      return settings.swap
    default:
      return false
  }
}

export function useIsPartialApproveEnabledBySettings(uiOrderType: Nullish<UiOrderType>): boolean {
  const [isSwapPartialApproveEnabledBySettings] = useSwapPartialApprovalToggleState()
  const { enablePartialApprovalBySettings: isLimitOrdersPartialApproveEnabledBySettings } =
    useAtomValue(limitOrdersSettingsAtom)
  const { enablePartialApprovalBySettings: isAdvancedOrdersPartialApproveEnabledBySettings } =
    useAtomValue(advancedOrdersSettingsAtom)

  return getIsPartialApproveEnabledBySettings(uiOrderType, {
    swap: isSwapPartialApproveEnabledBySettings,
    limit: isLimitOrdersPartialApproveEnabledBySettings,
    twap: isAdvancedOrdersPartialApproveEnabledBySettings,
  })
}
