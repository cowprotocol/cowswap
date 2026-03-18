import { useSetAtom } from 'jotai'
import type { WritableAtom } from 'jotai/vanilla'
import { ReactNode, useLayoutEffect, useRef } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWritableAtom = WritableAtom<any, any[], any>

interface HydrateAtomProps {
  atom: AnyWritableAtom
  state: unknown
  children: ReactNode
}

/**
 * Hydrates the atom with state so children (e.g. SwapUpdaters, quote/price logic) can read it.
 * Uses useLayoutEffect so the update runs before paint; ref guard is only used inside the effect
 * to satisfy react-hooks/refs (no ref access during render).
 */
export function HydrateAtom({ atom, state, children }: HydrateAtomProps): ReactNode {
  const prevStateRef = useRef<unknown | undefined>(undefined)
  const setAtom = useSetAtom(atom)

  useLayoutEffect(() => {
    if (Object.is(prevStateRef.current, state)) return
    prevStateRef.current = state
    setAtom(state)
  }, [state, setAtom])

  return <>{children}</>
}
