import { Timestamp } from 'types'

import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'

import { calculateValidTo } from 'utils/time'

export function calculateLimitOrdersDeadline(settingsState: LimitOrdersSettingsState): Timestamp {
  return settingsState.customDeadlineTimestamp
    ? settingsState.customDeadlineTimestamp
    : calculateValidTo(settingsState.deadlineMilliseconds / 1000)
}
