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
