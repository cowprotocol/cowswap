import { MutableRefObject, useLayoutEffect } from 'react'

interface UseAutoScrollParams<T> {
  ref: MutableRefObject<T | null>
  shouldAutoScroll: boolean
}

export function useAutoScroll<T extends HTMLElement>({ ref, shouldAutoScroll }: UseAutoScrollParams<T>) {
  useLayoutEffect(() => {
    if (shouldAutoScroll && ref?.current) {
      ref.current.scrollLeft = 0
    }
  }, [shouldAutoScroll, ref])
}
