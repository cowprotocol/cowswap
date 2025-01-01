import { useMemo } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useTokenAllowance } from 'legacy/hooks/useTokenAllowance'

import { ApprovalState } from 'common/hooks/useApproveState'

export interface ApprovalStateForSpenderResult {
  approvalState: ApprovalState
  currentAllowance?: CurrencyAmount<Token>
}

function toApprovalState(
  amountToApprove: Nullish<CurrencyAmount<Currency>>,
  spender: string | undefined,
  currentAllowance?: CurrencyAmount<Token>,
  pendingApproval?: boolean,
): ApprovalState {
  // Unknown amount or spender
  if (!amountToApprove || !spender) {
    return ApprovalState.UNKNOWN
  }

  // Native ETH is always approved
  if (getIsNativeToken(amountToApprove.currency)) {
    return ApprovalState.APPROVED
  }

  // Unknown allowance
  if (!currentAllowance) {
    return ApprovalState.UNKNOWN
  }

  // Enough allowance
  if (!currentAllowance.lessThan(amountToApprove)) {
    return ApprovalState.APPROVED
  }

  return pendingApproval ? ApprovalState.PENDING : ApprovalState.NOT_APPROVED
}

export function useApprovalStateForSpender(
  amountToApprove: Nullish<CurrencyAmount<Currency>>,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
): ApprovalStateForSpenderResult {
  const { account } = useWalletInfo()
  const currency = amountToApprove?.currency
  const token = currency && !getIsNativeToken(currency) ? currency : undefined

  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useIsPendingApproval(token, spender)

  return useMemo(() => {
    const approvalState = toApprovalState(amountToApprove, spender, currentAllowance, pendingApproval)
    return { approvalState, currentAllowance }
  }, [amountToApprove, currentAllowance, pendingApproval, spender])
}
