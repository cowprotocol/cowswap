import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

/**
 * Difference between local time and real time, in seconds.
 * Populated from quote timestamps via `useSetLocalTimeOffset`.
 */
export const localTimeOffsetAtom = atom<number | undefined>(undefined)

export function useLocalTimeOffset(): number | undefined {
  return useAtomValue(localTimeOffsetAtom)
}

export function useSetLocalTimeOffset(timeOffset: number | undefined): void {
  const setLocalTimeOffset = useSetAtom(localTimeOffsetAtom)

  useEffect(() => {
    setLocalTimeOffset(timeOffset)
  }, [timeOffset, setLocalTimeOffset])
}
