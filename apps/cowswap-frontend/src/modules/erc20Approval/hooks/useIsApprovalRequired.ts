import { useTokenSupportsPermit } from 'modules/permit'
import { useAmountsToSign, useDerivedTradeState } from 'modules/trade'

import { ApprovalState, useApproveState } from './useApproveState'

export function useIsApprovalRequired() {
  const { maximumSendSellAmount } = useAmountsToSign() || {}
  const { state: approvalState } = useApproveState(maximumSendSellAmount)
  const derivedTradeState = useDerivedTradeState()

  const { inputCurrency, tradeType } = derivedTradeState || {}

  const isPermitSupported = useTokenSupportsPermit(inputCurrency, tradeType)

  return !isPermitSupported && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)
}
