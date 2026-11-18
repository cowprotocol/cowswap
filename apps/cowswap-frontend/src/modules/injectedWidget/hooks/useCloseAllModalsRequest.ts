import { useAtomValue } from 'jotai'

import { closeAllModalsRequestAtom } from '../state/closeAllModalsRequestAtom'

/** Changes on every `closeAllModals()` call of the integrator */
export function useCloseAllModalsRequest(): number {
  return useAtomValue(closeAllModalsRequestAtom)
}
