import { useDeferredValue, useEffect, useState } from 'react'

import { useLatestRef } from './useLatestRef'

export function useStateWithDeferredValue<T>(
  value: T,
  deferredCallback: (deferredValue: T) => void,
): [T, React.Dispatch<React.SetStateAction<T>>, T] {
  const [state, setState] = useState(value)
  const deferredValue = useDeferredValue(state)

  const deferredCallbackRef = useLatestRef(deferredCallback)

  useEffect(() => {
    deferredCallbackRef.current(deferredValue)
  }, [deferredCallbackRef, deferredValue])

  return [state, setState, deferredValue]
}
