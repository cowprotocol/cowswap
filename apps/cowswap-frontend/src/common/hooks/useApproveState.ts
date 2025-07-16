import { useMemo } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useHasPendingApproval } from 'legacy/state/enhancedTransactions/hooks'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useTokenAllowance } from './useTokenAllowance'
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

export function useApproveState(amountToApprove: Nullish<CurrencyAmount<Currency>>): {
  state: ApprovalState
  currentAllowance: Nullish<bigint>
} {
  const spender = useTradeSpenderAddress()
  const token = getCurrencyToApprove(amountToApprove)
  const tokenAddress = token?.address?.toLowerCase()
  const currentAllowance = useTokenAllowance(token).data
  const pendingApproval = useHasPendingApproval(tokenAddress, spender)

  const approvalStateBase = useSafeMemo(() => {
    if (!amountToApprove || !currentAllowance) {
      return ApprovalState.UNKNOWN
    }

    const amountToApproveBigInt = BigInt(amountToApprove.quotient.toString())

    if (currentAllowance >= amountToApproveBigInt) {
      return ApprovalState.APPROVED
    }

    if (pendingApproval) {
      return ApprovalState.PENDING
    }

    if (currentAllowance < amountToApproveBigInt) {
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
function useAuxApprovalState(approvalStateBase: ApprovalState, currentAllowance?: bigint): ApprovalState {
  const previousApprovalState = usePrevious(approvalStateBase)
  const currentAllowanceString = currentAllowance
  const previousAllowanceString = usePrevious(currentAllowanceString)
  // Has allowance actually updated?
  const allowanceHasNotChanged = previousAllowanceString === currentAllowanceString

  return useMemo(() => {
    return previousApprovalState === ApprovalState.PENDING && allowanceHasNotChanged
      ? ApprovalState.PENDING
      : approvalStateBase
  }, [previousApprovalState, allowanceHasNotChanged, approvalStateBase])
}
