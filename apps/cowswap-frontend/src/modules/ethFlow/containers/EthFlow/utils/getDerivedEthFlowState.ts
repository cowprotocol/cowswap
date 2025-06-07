import { ActivityStatus } from 'common/types/activity'

import { EthFlowState } from '../../../services/ethFlow/types'
import { EthFlowContext } from '../../../state/ethFlowContextAtom'

// returns derived ethflow state from current props
// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function getDerivedEthFlowState(context: EthFlowContext): EthFlowState {
  const approveActivityStatus = context.approve.txStatus
  const wrapActivityStatus = context.wrap.txStatus
  const needsApproval = context.approve.isNeeded
  const needsWrap = context.wrap.isNeeded
  // approve state
  const approveExpired = approveActivityStatus === ActivityStatus.EXPIRED
  const approvePending =
    (!approveActivityStatus && context.approve.txHash) || approveActivityStatus === ActivityStatus.PENDING
  const approveConfirmed = approveActivityStatus === ActivityStatus.CONFIRMED
  const approveSentAndSuccessful = Boolean(!approvePending && approveConfirmed)
  const approveInsufficient = approveSentAndSuccessful && needsApproval
  const approveFinished = !needsApproval || approveSentAndSuccessful
  // wrap state
  const wrapExpired = wrapActivityStatus === ActivityStatus.EXPIRED
  const wrapPending = (!wrapActivityStatus && context.wrap.txHash) || wrapActivityStatus === ActivityStatus.PENDING
  const wrapConfirmed = wrapActivityStatus === ActivityStatus.CONFIRMED
  const wrapSentAndSuccessful = Boolean(!wrapPending && wrapConfirmed)
  const wrapNeeded = needsWrap && !wrapSentAndSuccessful
  const wrapFinished = !needsWrap || wrapSentAndSuccessful

  // PENDING states
  if (wrapPending || approvePending) {
    // Only wrap is pending
    if (wrapPending) {
      return EthFlowState.WrapPending
    }
    // Only approve is pending
    return EthFlowState.ApprovePending
  }
  // FAILED states
  if (approveExpired || wrapExpired) {
    // Only wrap failed
    if (wrapExpired) {
      return EthFlowState.WrapFailed
    }
    // Only approve failed
    return EthFlowState.ApproveFailed
  }
  // NEEDS wrap/approve state
  if (needsApproval || wrapNeeded) {
    // INSUFFICIENT approve state
    if (approveInsufficient) {
      return EthFlowState.ApproveInsufficient
    }
    // Only wrap needed
    if (wrapNeeded) {
      return EthFlowState.WrapNeeded
    }
    // Only approve needed
    return EthFlowState.ApproveNeeded
  }
  // BOTH successful, ready to swap
  if (approveFinished && wrapFinished) {
    return EthFlowState.SwapReady
  }

  return EthFlowState.Loading
}
