import { useMemo } from 'react'

import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { ApprovalState } from 'legacy/hooks/useApproveCallback'
import usePrevious from 'legacy/hooks/usePrevious'
import { useTokenAllowance } from 'legacy/hooks/useTokenAllowance'
import { useHasPendingApproval } from 'legacy/state/enhancedTransactions/hooks'

import { useWalletInfo } from 'modules/wallet'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

function getCurrencyToApprove(amountToApprove: CurrencyAmount<Currency> | null): Token | undefined {
  if (!amountToApprove) return undefined

  if (amountToApprove.currency.isNative) return amountToApprove.currency.wrapped

  return amountToApprove.currency
}

export function useApproveState(amountToApprove: CurrencyAmount<Currency> | null, spender?: string): ApprovalState {
  const { account } = useWalletInfo()
  const token = getCurrencyToApprove(amountToApprove)
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)

  const approvalStateBase = useSafeMemo(() => {
    if (!amountToApprove || !spender || !currentAllowance) {
      return ApprovalState.UNKNOWN
    }

    if (pendingApproval) {
      return ApprovalState.PENDING
    }

    if (currentAllowance.lessThan(amountToApprove)) {
      return ApprovalState.NOT_APPROVED
    }

    return ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  return useAuxApprovalState(approvalStateBase, currentAllowance)
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
  const currentAllowanceString = currentAllowance?.quotient.toString()
  const previousAllowanceString = usePrevious(currentAllowanceString)
  // Has allowance actually updated?
  const allowanceHasNotChanged = previousAllowanceString === currentAllowanceString

  return useMemo(() => {
    return previousApprovalState === ApprovalState.PENDING && allowanceHasNotChanged
      ? ApprovalState.PENDING
      : approvalStateBase
  }, [previousApprovalState, allowanceHasNotChanged, approvalStateBase])
}
