import { useMemo } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useTokenAllowance } from 'common/hooks/useTokenAllowance'

import { useApproveState } from './useApproveState'

import { ApprovalState } from '../types'

export interface ApprovalStateForSpenderResult {
  approvalState: ApprovalState
  currentAllowance?: bigint
}

export function useApprovalStateForSpender(
  amountToApprove?: CurrencyAmount<Currency> | null,
  spender?: string,
): ApprovalStateForSpenderResult {
  const { account } = useWalletInfo()
  const currency = amountToApprove?.currency
  const token = currency && !getIsNativeToken(currency) ? currency : undefined

  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const { state: approvalState } = useApproveState(amountToApprove)

  return useMemo(() => {
    return { approvalState, currentAllowance: currentAllowance?.data }
  }, [currentAllowance?.data, approvalState])
}
