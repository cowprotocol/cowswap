import { useAtomValue, useSetAtom } from 'jotai'

import { cowShedModalAtom, CowShedModalState } from './cowShedModalAtom'

export function useCowShedModal(): CowShedModalState {
  return useAtomValue(cowShedModalAtom)
}

export function useSetShedModal(): (
  state: CowShedModalState | ((state: CowShedModalState) => CowShedModalState),
) => void {
  return useSetAtom(cowShedModalAtom)
}
