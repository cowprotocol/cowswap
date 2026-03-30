import { useDeferredValue, useEffect, useRef, useState } from 'react'

import { useLatestRef } from './useLatestRef'

export function useStateWithDeferredValue<T>(
  value: T,
  deferredCallback: (deferredValue: T) => void,
): [T, React.Dispatch<React.SetStateAction<T>>, T] {
  const [state, setState] = useState(value)
  const deferredValue = useDeferredValue(state)

  const isFirstRender = useRef(true)
  const deferredCallbackRef = useLatestRef(deferredCallback)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    deferredCallbackRef.current(deferredValue)
  }, [deferredCallbackRef, deferredValue])

  return [state, setState, deferredValue]
}
