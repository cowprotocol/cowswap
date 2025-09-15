import { usePermitInfo } from 'modules/permit'
import { useDerivedTradeState } from 'modules/trade'

import { useApproveState } from './useApproveState'
import { useGetAmountToSignApprove } from './useGetAmountToSignApprove'

import { ApprovalState } from '../types'

export enum ApproveRequiredReason {
  NotRequired,
  Required,
  Eip2612PermitRequired,
  DaiLikePermitRequired,
}

export function useIsApprovalOrPermitRequired(): ApproveRequiredReason {
  const amountToApprove = useGetAmountToSignApprove()
  const { state: approvalState } = useApproveState(amountToApprove)
  const derivedTradeState = useDerivedTradeState()

  const { inputCurrency, tradeType } = derivedTradeState || {}

  const { type } = usePermitInfo(inputCurrency, tradeType) || {}

  const isPermitSupported = type && type !== 'unsupported'

  if (!isPermitSupported && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)) {
    return ApproveRequiredReason.Required
  }

  // todo fix for limit orders and other forms
  if (type === 'dai-like') return ApproveRequiredReason.DaiLikePermitRequired
  if (type === 'eip-2612') return ApproveRequiredReason.Eip2612PermitRequired

  return ApproveRequiredReason.NotRequired
}
