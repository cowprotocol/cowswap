import { useTokenSupportsPermit } from 'modules/permit'
import { useDerivedTradeState } from 'modules/trade'

import { useApproveState } from './useApproveState'
import { useGetAmountToSignApprove } from './useGetAmountToSignApprove'

import { ApprovalState } from '../types'

export enum ApproveRequiredReason {
  NotRequired,
  Required,
  PermitSupported,
}

export function useIsApprovalOrPermitRequired(): ApproveRequiredReason {
  const amountToApprove = useGetAmountToSignApprove()
  const { state: approvalState } = useApproveState(amountToApprove)
  const derivedTradeState = useDerivedTradeState()

  const { inputCurrency, tradeType } = derivedTradeState || {}

  const isPermitSupported = useTokenSupportsPermit(inputCurrency, tradeType)

  if (!isPermitSupported && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)) {
    return ApproveRequiredReason.Required
  }

  // todo fix for limit orders and other forms
  if (isPermitSupported) return ApproveRequiredReason.PermitSupported

  return ApproveRequiredReason.NotRequired
}
