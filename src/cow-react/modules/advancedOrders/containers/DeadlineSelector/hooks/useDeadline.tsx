import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { advancedOrdersSettingsAtom } from '@cow/modules/advancedOrders/state/advancedOrdersSettingsAtom'

export function useDeadline() {
  const { isCustomDeadline, customDeadline, deadline } = useAtomValue(advancedOrdersSettingsAtom)

  return useMemo(() => {
    return {
      isCustomDeadline,
      customDeadline,
      deadline,
    }
  }, [isCustomDeadline, deadline, customDeadline])
}
