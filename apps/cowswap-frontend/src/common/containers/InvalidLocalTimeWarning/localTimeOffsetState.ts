import { atom, useAtomValue, useSetAtom } from 'jotai'
import { useEffect } from 'react'

/**
 * Difference between local time and real time, in seconds
 */
const localTimeOffsetState = atom<number | undefined>(undefined)

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useSetLocalTimeOffset(timeOffset: number | undefined) {
  const setLocalTimeOffset = useSetAtom(localTimeOffsetState)

  useEffect(() => {
    setLocalTimeOffset(timeOffset)
  }, [timeOffset, setLocalTimeOffset])
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useLocalTimeOffset() {
  return useAtomValue(localTimeOffsetState)
}
