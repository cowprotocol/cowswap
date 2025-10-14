import { useCallback } from 'react'

import { useUpdateApproveProgressModalState } from './useUpdateApproveProgressModalState'

import { initialApproveProgressModalState } from '../containers'

export function useResetApproveProgressModalState(): () => void {
  const updateApproveProgressState = useUpdateApproveProgressModalState()
  return useCallback(() => updateApproveProgressState(initialApproveProgressModalState), [updateApproveProgressState])
}
