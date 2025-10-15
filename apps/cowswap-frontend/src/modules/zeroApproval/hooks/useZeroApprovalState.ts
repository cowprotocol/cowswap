import { useAtomValue } from 'jotai'

import { ZeroApprovalState, zeroApprovalState } from '../state/zeroApprovalState'

export function useZeroApprovalState(): ZeroApprovalState {
  return useAtomValue(zeroApprovalState)
}
