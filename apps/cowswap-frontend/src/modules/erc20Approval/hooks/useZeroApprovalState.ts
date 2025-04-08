import { useAtomValue } from 'jotai'

import { zeroApprovalState } from '../state/zeroApprovalState'

export function useZeroApprovalState() {
  return useAtomValue(zeroApprovalState)
}
