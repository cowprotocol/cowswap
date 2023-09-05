import { calculateValidTo } from '@cowswap/common-utils'

import { Timestamp } from 'types'

import { LimitOrdersSettingsState } from 'modules/limitOrders/state/limitOrdersSettingsAtom'

export function calculateLimitOrdersDeadline(settingsState: LimitOrdersSettingsState): Timestamp {
  return settingsState.customDeadlineTimestamp
    ? settingsState.customDeadlineTimestamp
    : calculateValidTo(settingsState.deadlineMilliseconds / 1000)
}
