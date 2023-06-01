import { ApprovalState } from 'legacy/hooks/useApproveCallback'

import { TradeFormValidation, TradeFormValidationContext } from '../types'

export function validateTradeForm(state: TradeFormValidationContext): TradeFormValidation {
  const { approvalState, isTxBundlingEnabled, isExpertMode } = state
  const approvalRequired = approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING

  if (approvalRequired) {
    if (isTxBundlingEnabled) {
      if (isExpertMode) {
        return TradeFormValidation.ExpertApproveAndSwap
      }
      return TradeFormValidation.ApproveAndSwap
    }
    return TradeFormValidation.Approve
  }

  return TradeFormValidation.Default
}
