import { useSetAtom } from 'jotai'
import type { WritableAtom } from 'jotai/vanilla'
import { ReactNode, useRef } from 'react'

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

  // Intentional render-phase side effect: sets the atom synchronously so
  // children read the updated value in the same render pass (avoids the one-render delay of useEffect).
  // Guard prevents writes when state is unchanged.
  // eslint-disable-next-line react-hooks/refs
  if (!Object.is(prevStateRef.current, state)) {
    // eslint-disable-next-line react-hooks/refs
    prevStateRef.current = state
    setAtom(state)
  }

  return <>{children}</>
}
