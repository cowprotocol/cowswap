import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useApprovalStateForSpender } from 'modules/erc20Approve'

import { useTokenContract } from 'common/hooks/useContract'

import { shouldZeroApprove as shouldZeroApproveFn } from './shouldZeroApprove'

// TODO: Handle tokens that don't allow approvals larger than the balance of the wallet
/**
 * Return null when decision is not taken yet
 * @param amountToApprove
 * @param ignoreApproveState
 */
export function useShouldZeroApprove(
  amountToApprove: Nullish<CurrencyAmount<Currency>>,
  ignoreApproveState?: boolean,
): () => Promise<boolean | null> {
  const spender = useTradeSpenderAddress()
  const currency = amountToApprove?.currency
  const token = currency && !getIsNativeToken(currency) ? currency : undefined
  const { contract: tokenContract } = useTokenContract(token?.address)
  const approvalState = useApprovalStateForSpender(amountToApprove, spender)

  return useCallback(() => {
    return shouldZeroApproveFn({
      approvalState: approvalState.approvalState,
      amountToApprove,
      tokenContract,
      spender,
      forceApprove: ignoreApproveState,
    })
  }, [ignoreApproveState, approvalState.approvalState, amountToApprove, spender, tokenContract])
}
