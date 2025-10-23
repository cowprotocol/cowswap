import { useAtomValue } from 'jotai'

import { isPartialApproveEnabledAtom } from '../state/isPartialApproveEnabledAtom'

export function useIsPartialApprovalModeSelected(): boolean {
  return useAtomValue(isPartialApproveEnabledAtom)
}
