import { useMemo } from 'react'

import { useTokensAllowances } from '@cowprotocol/balances-and-allowances'
import { usePrevious } from '@cowprotocol/common-hooks'
import { getWrappedToken } from '@cowprotocol/common-utils'
import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ApprovalState } from 'legacy/hooks/useApproveCallback/useApproveCallbackMod'
import { useHasPendingApproval } from 'legacy/state/enhancedTransactions/hooks'

import { useSafeMemo } from 'common/hooks/useSafeMemo'

import { useTradeSpenderAddress } from './useTradeSpenderAddress'

function getCurrencyToApprove(amountToApprove: Nullish<CurrencyAmount<Currency>>): Token | undefined {
  if (!amountToApprove) return undefined

  return getWrappedToken(amountToApprove.currency)
}

export function useApproveState(amountToApprove: Nullish<CurrencyAmount<Currency>>): ApprovalState {
  const spender = useTradeSpenderAddress()
  const token = getCurrencyToApprove(amountToApprove)
  const tokenAddress = token?.address?.toLowerCase()
  const allowances = useTokensAllowances()
  const pendingApproval = useHasPendingApproval(tokenAddress, spender)

  const currentAllowance = tokenAddress ? allowances.values[tokenAddress] : undefined

  const approvalStateBase = useSafeMemo(() => {
    if (!amountToApprove || !currentAllowance) {
      return ApprovalState.UNKNOWN
    }

    const amountToApproveString = amountToApprove.quotient.toString()

    if (currentAllowance.gte(amountToApproveString)) {
      return ApprovalState.APPROVED
    }

    if (pendingApproval) {
      return ApprovalState.PENDING
    }

    if (currentAllowance.lt(amountToApproveString)) {
      return ApprovalState.NOT_APPROVED
    }

    return ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval])

  return useAuxApprovalState(approvalStateBase, currentAllowance)
}

/**
 *
 * ApprovalState is sometimes incorrectly returned AFTER a successful approval
 * causing incorrect UI display around the app because of incorrect pending check
 *
 * Solution: we check the prev approval state and also check if the allowance has been updated
 */
function useAuxApprovalState(approvalStateBase: ApprovalState, currentAllowance?: BigNumber): ApprovalState {
  const previousApprovalState = usePrevious(approvalStateBase)
  const currentAllowanceString = currentAllowance?.toHexString()
  const previousAllowanceString = usePrevious(currentAllowanceString)
  // Has allowance actually updated?
  const allowanceHasNotChanged = previousAllowanceString === currentAllowanceString

  return useMemo(() => {
    return previousApprovalState === ApprovalState.PENDING && allowanceHasNotChanged
      ? ApprovalState.PENDING
      : approvalStateBase
  }, [previousApprovalState, allowanceHasNotChanged, approvalStateBase])
}
