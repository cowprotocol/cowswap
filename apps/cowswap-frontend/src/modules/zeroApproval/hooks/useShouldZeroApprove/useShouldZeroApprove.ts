import { useCallback } from 'react'

import { useTradeSpenderAddress } from '@cowprotocol/balances-and-allowances'
import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { Nullish } from 'types'
import { useConfig } from 'wagmi'

import { useApprovalStateForSpender } from 'modules/erc20Approve'

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
  const config = useConfig()
  const spender = useTradeSpenderAddress()
  const currency = amountToApprove?.currency
  const token = currency && !getIsNativeToken(currency) ? currency : undefined
  const approvalState = useApprovalStateForSpender(amountToApprove, spender)

  return useCallback(() => {
    return shouldZeroApproveFn({
      approvalState: approvalState.approvalState,
      amountToApprove,
      tokenAddress: token?.address,
      spender,
      forceApprove: ignoreApproveState,
      config,
    })
  }, [ignoreApproveState, approvalState.approvalState, amountToApprove, spender, token?.address, config])
}
