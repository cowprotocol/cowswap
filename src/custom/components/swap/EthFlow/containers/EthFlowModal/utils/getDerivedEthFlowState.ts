import { EthFlowState } from '../../..'
import { DerivedEthFlowStateProps } from '../../../pure/EthFlowModalContent/EthFlowModalBottomContent'

// returns derived ethflow state from current props
export function getDerivedEthFlowState(params: DerivedEthFlowStateProps) {
  const { approveError, wrapError, approveState, wrapState, needsApproval, needsWrap, isExpertMode } = params
  // approve state
  const approveExpired = approveState?.isExpired
  const approvePending = approveState?.isPending
  const approveSentAndSuccessful = Boolean(!approveError && !approvePending && approveState?.isConfirmed)
  const approveInsufficient = approveSentAndSuccessful && needsApproval
  const approveFinished = !needsApproval || approveSentAndSuccessful
  // wrap state
  const wrapExpired = wrapState?.isExpired
  const wrapPending = wrapState?.isPending
  const wrapSentAndSuccessful = Boolean(!wrapError && !wrapPending && wrapState?.isConfirmed)
  const wrapNeeded = needsWrap && !wrapSentAndSuccessful
  const wrapFinished = !needsWrap || wrapSentAndSuccessful

  // PENDING states
  if (wrapPending || approvePending) {
    // expertMode only - both operations pending
    if (isExpertMode && wrapPending && approvePending) {
      return EthFlowState.WrapAndApprovePending
    }
    // Only wrap is pending
    else if (wrapPending) {
      return EthFlowState.WrapUnwrapPending
    }
    // Only approve is pending
    else return EthFlowState.ApprovePending
  }
  // FAILED states
  else if (approveExpired || wrapExpired) {
    // expertMode only - BOTH operations failed
    if (isExpertMode && approveExpired && wrapExpired) {
      return EthFlowState.WrapAndApproveFailed
    }
    // Only wrap failed
    else if (wrapExpired) {
      return EthFlowState.WrapUnwrapFailed
    }
    // Only approve failed
    else return EthFlowState.ApproveFailed
  }
  // NEEDS wrap/approve state
  else if (needsApproval || wrapNeeded) {
    // INSUFFICIENT approve state
    if (approveInsufficient) {
      return EthFlowState.ApproveInsufficient
    }
    // in expertMode and we need to wrap and swap
    else if (isExpertMode && needsApproval && wrapNeeded) {
      return EthFlowState.WrapAndApproveNeeded
    }
    // Only wrap needed
    else if (wrapNeeded) {
      return EthFlowState.WrapNeeded
    }
    // Only approve needed
    else {
      return EthFlowState.ApproveNeeded
    }
  }
  // BOTH successful, ready to swap
  else if (approveFinished && wrapFinished) {
    return EthFlowState.SwapReady
  }
  // LOADING
  else {
    return EthFlowState.Loading
  }
}
