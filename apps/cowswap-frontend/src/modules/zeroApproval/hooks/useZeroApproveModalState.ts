import { ModalState, useModalState } from 'common/hooks/useModalState'

import { useZeroApprovalState } from './useZeroApprovalState'

export function useZeroApproveModalState(): ModalState<void> {
  const { isApproving } = useZeroApprovalState()

  return useModalState<void>(isApproving)
}
