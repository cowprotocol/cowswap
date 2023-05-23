import { useMemo } from 'react'
import { useAtomValue } from 'jotai'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

export function useDeadline() {
  const { isCustomDeadline, customDeadline, deadline } = useAtomValue(twapOrdersSettingsAtom)

  return useMemo(() => {
    return {
      isCustomDeadline,
      customDeadline,
      deadline,
    }
  }, [isCustomDeadline, deadline, customDeadline])
}
