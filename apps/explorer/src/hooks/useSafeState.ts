import { Dispatch, SetStateAction, useState, useEffect, useCallback } from 'react'

interface UseSafeState {
  <S = undefined>(initialState: S | (() => S)): [state: S, setState: Dispatch<SetStateAction<S>>]
}

const useSafeState: UseSafeState = (initialState) => {
  const [state, setState] = useState(initialState)

  // can drop useRef, because we only need one closure
  // that is created at the start
  // and preserved thanks to deps = []
  let mounted = false

  useEffect(() => {
    // the `mounted` from the very first render
    // is saved in this closure's outer scope
    // eslint-disable-next-line react-hooks/exhaustive-deps
    mounted = true
    return (): void => {
      // resets on unmount
      mounted = false
    }
  }, [])

  const setSafeState = useCallback((newState) => {
    // this is the same `mounted` as in useEffect
    // deps are the same ([]) so closure's outer scope is the same
    if (mounted) setState(newState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [state, setSafeState]
}

export default useSafeState
