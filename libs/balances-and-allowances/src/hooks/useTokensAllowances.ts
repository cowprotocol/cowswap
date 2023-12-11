import { useAtomValue } from 'jotai'

import { AllowancesState, allowancesState } from '../state/allowancesAtom'

export function useTokensAllowances(): AllowancesState {
  return useAtomValue(allowancesState)
}
