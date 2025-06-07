import { useAtomValue } from 'jotai'

import { zeroApprovalState } from '../state/zeroApprovalState'

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useZeroApprovalState() {
  return useAtomValue(zeroApprovalState)
}
