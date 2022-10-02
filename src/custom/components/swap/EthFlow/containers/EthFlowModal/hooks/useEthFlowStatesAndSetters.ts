import { useState } from 'react'
// eslint-disable-next-line no-restricted-imports
import { useSingleActivityState } from 'hooks/useActivityDerivedState'
import { ApprovalState } from 'hooks/useApproveCallback'
import { EthFlowProps, PendingHashMap } from '..'

/**
 * useEthFlowStatesAndSetters
 *
 * @returns all ETH-FLOW states and setters related to wrap/approve
 */
export function useEthFlowStatesAndSetters({
  chainId,
  approvalState,
}: Pick<EthFlowProps, 'approvalState'> & {
  chainId?: number
}) {
  const [pendingHashMap, setPendingHashMap] = useState<PendingHashMap>({
    approveHash: undefined,
    wrapHash: undefined,
  })
  // maintain own local state of approve/wrap states
  const [loading, setLoading] = useState(false)
  // APPROVE STATE - use activity state and derive isPending based on both the hook and activity state
  const approvalActivityState = useSingleActivityState({ chainId, id: pendingHashMap.approveHash || '' })
  const approvalDerivedState = !!approvalActivityState
    ? {
        ...approvalActivityState,
        isPending: approvalActivityState?.isPending || approvalState === ApprovalState.PENDING,
      }
    : null
  const [approveSubmitted, setApproveSubmitted] = useState(false)
  const [approveError, setApproveError] = useState<Error | null>(null)
  // WRAP STATE
  const wrapActivityState = useSingleActivityState({ chainId, id: pendingHashMap.wrapHash || '' })
  const [wrapSubmitted, setWrapSubmitted] = useState(false)
  const [wrapError, setWrapError] = useState<Error | null>(null)

  return {
    pendingHashMap,
    setPendingHashMap,
    loading,
    setLoading,
    // APPROVE
    approvalDerivedState,
    approveSubmitted,
    setApproveSubmitted,
    approveError,
    setApproveError,
    // WRAPPING
    wrapDerivedState: wrapActivityState,
    wrapSubmitted,
    setWrapSubmitted,
    wrapError,
    setWrapError,
  }
}
