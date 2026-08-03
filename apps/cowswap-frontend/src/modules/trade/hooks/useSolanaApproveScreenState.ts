import { useAtom } from 'jotai'

import { SolanaApproveState, solanaApproveStateAtom } from '../state/solanaApproveStateAtom'

export function useSolanaApproveScreenState(): [SolanaApproveState, (update: SolanaApproveState) => void] {
  return useAtom(solanaApproveStateAtom)
}
