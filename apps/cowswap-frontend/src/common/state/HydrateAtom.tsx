import { useSetAtom } from 'jotai'
import type { WritableAtom } from 'jotai/vanilla'
import { ReactNode, useLayoutEffect } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyWritableAtom = WritableAtom<any, any[], any>

interface HydrateAtomProps {
  atom: AnyWritableAtom
  state: unknown
  children: ReactNode
}

export function HydrateAtom({ atom, state, children }: HydrateAtomProps): ReactNode {
  const setAtom = useSetAtom(atom)

  // Setting the atom synchronously during render (the previous approach here) can update an
  // already-mounted sibling/child subscriber (e.g. `SwapUpdaters`, reading this atom via
  // `useAtomValue`) while this component is still mid-render — React logs "Cannot update a
  // component while rendering a different component" for that, and the update can be silently
  // dropped (observed as e.g. the sell token intermittently reverting to "Select a token").
  // `useLayoutEffect` still runs synchronously before the browser paints (no visible flicker,
  // unlike a plain `useEffect`), but as a commit-phase effect rather than a render-phase one, it's
  // safe to update other components from.
  useLayoutEffect(() => {
    setAtom(state)
  }, [state, setAtom])

  return <>{children}</>
}
