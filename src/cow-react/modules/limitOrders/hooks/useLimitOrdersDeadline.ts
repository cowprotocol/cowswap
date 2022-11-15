import { calculateValidTo } from '@cow/utils/time'
import { useAtomValue } from 'jotai/utils'
import { limitOrdersSettingsAtom } from '@cow/modules/limitOrders/state/limitOrdersSettingsAtom'
import { Timestamp } from '@cow/types'

export function useLimitOrdersDeadline(): Timestamp {
  const settingsState = useAtomValue(limitOrdersSettingsAtom)

  return settingsState.customDeadlineTimestamp
    ? settingsState.customDeadlineTimestamp
    : calculateValidTo(settingsState.deadlineMilliseconds / 1000)
}
