import { useAtomValue } from 'jotai'

import { solanaSigningDeadlineAtom, SolanaSigningDeadlineState } from './solanaSigningDeadlineAtom'

export function useSolanaSigningDeadline(): SolanaSigningDeadlineState | null {
  return useAtomValue(solanaSigningDeadlineAtom)
}
