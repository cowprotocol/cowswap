import { useMemo } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { ApprovalState, useApproveState } from 'modules/erc20Approve/hooks/useApproveState'

import { useTokenAllowance } from 'common/hooks/useTokenAllowance'

export interface ApprovalStateForSpenderResult {
  approvalState: ApprovalState
  currentAllowance?: bigint
}

export function useApprovalStateForSpender(
  amountToApprove: Nullish<CurrencyAmount<Currency>>,
  spender?: string,
): ApprovalStateForSpenderResult {
  const { account } = useWalletInfo()
  const currency = amountToApprove?.currency
  const token = currency && !getIsNativeToken(currency) ? currency : undefined

  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender).data
  const { state: approvalState } = useApproveState(amountToApprove)

  return useMemo(() => {
    return { approvalState, currentAllowance }
  }, [currentAllowance, approvalState])
}
