import { useMemo } from 'react'

import { useTokensAllowances } from '@cowprotocol/balances-and-allowances'
import { usePrevious } from '@cowprotocol/common-hooks'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useHasPendingApproval } from 'legacy/state/enhancedTransactions/hooks'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useTradeSpenderAddress } from './useTradeSpenderAddress'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

function getCurrencyToApprove(amountToApprove: Nullish<CurrencyAmount<Currency>>): Token | undefined {
  if (!amountToApprove) return undefined

  return getWrappedToken(amountToApprove.currency)
}

export function useApproveState(
  amountToApprove: Nullish<CurrencyAmount<Currency>>,
  amountToCheckAgainstAllowance?: Nullish<CurrencyAmount<Currency>>
): {
  state: ApprovalState
  currentAllowance: Nullish<CurrencyAmount<Currency>>
} {
  const spender = useTradeSpenderAddress()
  const token = getCurrencyToApprove(amountToApprove)
  const tokenAddress = token?.address?.toLowerCase()
  const allowances = useTokensAllowances()
  const pendingApproval = useHasPendingApproval(tokenAddress, spender)

  const tokenAllowance = useMemo(() => {
    const tokenRawAllowance = tokenAddress ? allowances.values[tokenAddress] : undefined

    if (!token || !tokenRawAllowance) return undefined

    return CurrencyAmount.fromRawAmount(token, tokenRawAllowance.toHexString())
  }, [allowances, token, tokenAddress])

  const currentAllowance = amountToCheckAgainstAllowance || tokenAllowance

  const approvalStateBase = useSafeMemo(() => {
    if (!amountToApprove || !currentAllowance) {
      return ApprovalState.UNKNOWN
    }

    const amountToApproveString = amountToApprove.quotient.toString()

    if (currentAllowance.greaterThan(amountToApproveString) || currentAllowance.equalTo(amountToApproveString)) {
      return ApprovalState.APPROVED
    }

    if (pendingApproval) {
      return ApprovalState.PENDING
    }

    if (currentAllowance.lessThan(amountToApproveString)) {
      return ApprovalState.NOT_APPROVED
    }

    return ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval])

  const state = useAuxApprovalState(approvalStateBase, currentAllowance)

  return useSafeMemo(() => ({ state, currentAllowance }), [state, currentAllowance])
}

/**
 *
 * ApprovalState is sometimes incorrectly returned AFTER a successful approval
 * causing incorrect UI display around the app because of incorrect pending check
 *
 * Solution: we check the prev approval state and also check if the allowance has been updated
 */
function useAuxApprovalState(
  approvalStateBase: ApprovalState,
  currentAllowance?: CurrencyAmount<Currency>
): ApprovalState {
  const previousApprovalState = usePrevious(approvalStateBase)
  const currentAllowanceString = currentAllowance?.quotient.toString(16)
  const previousAllowanceString = usePrevious(currentAllowanceString)
  // Has allowance actually updated?
  const allowanceHasNotChanged = previousAllowanceString === currentAllowanceString

  return useMemo(() => {
    return previousApprovalState === ApprovalState.PENDING && allowanceHasNotChanged
      ? ApprovalState.PENDING
      : approvalStateBase
  }, [previousApprovalState, allowanceHasNotChanged, approvalStateBase])
}
