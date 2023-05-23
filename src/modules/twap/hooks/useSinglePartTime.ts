import ms from 'ms'
import { useMemo } from 'react'
import { displayTime } from 'utils/displayTime'
import { useDeadline } from './useDeadline'
import { useAtomValue } from 'jotai'
import { twapOrdersSettingsAtom } from '../state/twapOrdersSettingsAtom'

// TODO: refactor
export function useSinglePartTime() {
  const { isCustomDeadline, deadline, customDeadline } = useDeadline()
  const { numberOfPartsValue } = useAtomValue(twapOrdersSettingsAtom)

  return useMemo(() => {
    const { hours: h, minutes: m } = customDeadline
    const totalTime = isCustomDeadline ? ms(`${h}h`) + ms(`${m}m`) : deadline
    const time = totalTime / numberOfPartsValue

    return displayTime({ time, defaultOutput: '-' })
  }, [deadline, numberOfPartsValue, customDeadline, isCustomDeadline])
}
