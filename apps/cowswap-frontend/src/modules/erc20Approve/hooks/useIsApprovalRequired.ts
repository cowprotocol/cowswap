import { useTokenSupportsPermit } from 'modules/permit'
import { useDerivedTradeState } from 'modules/trade'

import { useApproveState } from './useApproveState'
import { useGetAmountToSignApprove } from './useGetAmountToSignApprove'

import { ApprovalState } from '../types'

export function useIsApprovalRequired(): boolean {
  const amountToApprove = useGetAmountToSignApprove()
  const { state: approvalState } = useApproveState(amountToApprove)
  const derivedTradeState = useDerivedTradeState()

  const { inputCurrency, tradeType } = derivedTradeState || {}

  const isPermitSupported = useTokenSupportsPermit(inputCurrency, tradeType)

  return !isPermitSupported && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)
}
