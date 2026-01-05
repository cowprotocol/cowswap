import { useAtomValue } from 'jotai'

import { layoutStateAtom, LayoutState } from '../atoms'

export function useLayoutState(): LayoutState {
  return useAtomValue(layoutStateAtom)
}
