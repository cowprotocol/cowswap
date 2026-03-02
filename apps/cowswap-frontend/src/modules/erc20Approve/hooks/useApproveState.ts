import { useMemo } from 'react'

import { usePrevious } from '@cowprotocol/common-hooks'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { Nullish } from '@cowprotocol/types'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { useHasPendingApproval } from 'legacy/state/enhancedTransactions/hooks'

import { useSafeMemo } from 'common/hooks/useSafeMemo'
import { useTokenAllowance } from 'common/hooks/useTokenAllowance'

import { ApprovalState } from '../types'
import { getApprovalState } from '../utils'

function getCurrencyToApprove(amountToApprove: Nullish<CurrencyAmount<Currency>>): Token | undefined {
  if (!amountToApprove) return undefined

  return getWrappedToken(amountToApprove.currency)
}

export function useApproveState(amountToApprove: Nullish<CurrencyAmount<Currency>>): {
  state: ApprovalState
  currentAllowance: Nullish<bigint>
} {
  const token = getCurrencyToApprove(amountToApprove)
  const tokenAddress = token?.address?.toLowerCase()
  const currentAllowance = useTokenAllowance(token)
  const pendingApproval = useHasPendingApproval(tokenAddress)

  const approvalStateBase = useSafeMemo(() => {
    return getApprovalState(amountToApprove, currentAllowance, pendingApproval)
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
  const previousAllowance = usePrevious(currentAllowance)
  // Has allowance actually updated?
  const allowanceHasNotChanged = previousAllowance === currentAllowance

  return useMemo(() => {
    return previousApprovalState === ApprovalState.PENDING && allowanceHasNotChanged
      ? ApprovalState.PENDING
      : approvalStateBase
  }, [previousApprovalState, allowanceHasNotChanged, approvalStateBase])
}
