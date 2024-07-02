import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

/**
 * Difference between local time and real time, in seconds
 */
const localTimeOffsetState = atom<number | undefined>(undefined)

export function useSetLocalTimeOffset(timeOffset: number | undefined) {
  const setLocalTimeOffset = useSetAtom(localTimeOffsetState)

  useEffect(() => {
    setLocalTimeOffset(timeOffset)
  }, [timeOffset, setLocalTimeOffset])
}

export function useLocalTimeOffset() {
  return useAtomValue(localTimeOffsetState)
}
