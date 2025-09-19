import { useAtomValue, useSetAtom } from 'jotai'

import { isPartialApproveSelectedByUserAtom } from './isPartialApproveSelectedByUserAtom'

export function useIsPartialApproveSelectedByUser(): boolean {
  return useAtomValue(isPartialApproveSelectedByUserAtom)
}

export function useSetIsPartialApproveSelectedByUser(): (value: boolean) => void {
  return useSetAtom(isPartialApproveSelectedByUserAtom)
}
