import { calculateValidTo } from '@cow/utils/time'
import { LimitOrdersSettingsState } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { Timestamp } from '@cow/types'

export function calculateLimitOrdersDeadline(settingsState: LimitOrdersSettingsState): Timestamp {
  return settingsState.customDeadlineTimestamp
    ? settingsState.customDeadlineTimestamp
    : calculateValidTo(settingsState.deadlineMilliseconds / 1000)
}
