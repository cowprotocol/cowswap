import { useTokenSupportsPermit } from 'modules/permit'
import { useAmountsToSign, useDerivedTradeState } from 'modules/trade'

import { useHasPendingOrdersWithPermitForInputToken } from 'common/hooks/useHasPendingOrdersWithPermit'

import { ApprovalState, useApproveState } from './useApproveState'

export function useIsApprovalRequired(): boolean {
  const { maximumSendSellAmount } = useAmountsToSign() || {}
  const { state: approvalState } = useApproveState(maximumSendSellAmount)
  const derivedTradeState = useDerivedTradeState()

  const { inputCurrency, tradeType } = derivedTradeState || {}

  const isPermitSupported = useTokenSupportsPermit(inputCurrency, tradeType)
  const hasActiveOrderWithTheSamePermit = useHasPendingOrdersWithPermitForInputToken(inputCurrency, isPermitSupported)

  // if the user has order with permit for current token that wasn't executed yet
  const allowPermitSigning = isPermitSupported && !hasActiveOrderWithTheSamePermit

  return (
    !allowPermitSigning && (approvalState === ApprovalState.NOT_APPROVED || approvalState === ApprovalState.PENDING)
  )
}
