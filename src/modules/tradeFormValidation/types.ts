import { ApprovalState } from 'legacy/hooks/useApproveCallback'

export enum TradeFormValidation {
  Default,
  Approve,
  ExpertApproveAndSwap,
  ApproveAndSwap,
}

export interface TradeFormValidationLocalContext {
  isExpertMode: boolean
}

export interface TradeFormValidationCommonContext {
  approvalState: ApprovalState
  isTxBundlingEnabled: boolean
}

export interface TradeFormValidationContext extends TradeFormValidationLocalContext, TradeFormValidationCommonContext {}
