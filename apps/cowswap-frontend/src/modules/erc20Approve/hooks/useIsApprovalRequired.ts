import { useTokenSupportsPermit } from 'modules/permit'
import { useAmountsToSign, useDerivedTradeState } from 'modules/trade'

import { useApproveState } from './useApproveState'

import { ApprovalState } from '../types'

export function useIsApprovalRequired(): boolean {
  const { maximumSendSellAmount } = useAmountsToSign() || {}
  const { state: approvalState } = useApproveState(maximumSendSellAmount)
  const derivedTradeState = useDerivedTradeState()

  const { inputCurrency, tradeType } = derivedTradeState || {}

  const isPermitSupported = useTokenSupportsPermit(inputCurrency, tradeType)

  return !isPermitSupported && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)
}
