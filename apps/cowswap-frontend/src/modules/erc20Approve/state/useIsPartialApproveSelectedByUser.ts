import { useAtomValue, useSetAtom } from 'jotai'

import { isPartialApproveSelectedByUserAtom } from './isPartialApproveSelectedByUserAtom'

import { useIsInfiniteApproveDisabled } from '../hooks/useIsInfiniteApproveDisabled'

export function useIsPartialApproveSelectedByUser(): boolean {
  const isSelectedByUser = useAtomValue(isPartialApproveSelectedByUserAtom)
  const isInfiniteApproveDisabled = useIsInfiniteApproveDisabled()

  return isSelectedByUser || isInfiniteApproveDisabled
}

export function useSetIsPartialApproveSelectedByUser(): (value: boolean) => void {
  return useSetAtom(isPartialApproveSelectedByUserAtom)
}
