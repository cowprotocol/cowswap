import { useCallback, useMemo } from 'react'

import { calculateGasMargin, getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'

import { Nullish } from 'types'

import { useTokenAllowance } from 'legacy/hooks/useTokenAllowance'

import { ApprovalState } from 'common/hooks/useApproveState'
import { useTokenContract } from 'common/hooks/useContract'

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

// TODO: Break down this large function into smaller functions
// eslint-disable-next-line max-lines-per-function
export function useApproval(
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean,
): [
  ApprovalState,
  () => Promise<{ response: TransactionResponse; tokenAddress: string; spenderAddress: string } | undefined>,
] {
  const currency = amountToApprove?.currency
  const token = currency && !getIsNativeToken(currency) ? currency : undefined

  // check the current approval status
  const approvalState = useApprovalStateForSpender(amountToApprove, spender, useIsPendingApproval).approvalState

  const { contract: tokenContract, chainId: tokenChainId } = useTokenContract(token?.address)

  const approve = useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || 'Token'} approval failed:`, error)
      return
    }

    // Bail early if there is an issue.
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      return logFailure('approve was called unnecessarily')
    } else if (!tokenChainId) {
      return logFailure('no chainId')
    } else if (!token) {
      return logFailure('no token')
    } else if (!tokenContract) {
      return logFailure('tokenContract is null')
    } else if (!amountToApprove) {
      return logFailure('missing amount to approve')
    } else if (!spender) {
      return logFailure('no spender')
    }

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
      // general fallback for tokens which restrict approval amounts
      useExact = true
      return tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString())
    })

    return tokenContract
      .approve(spender, useExact ? amountToApprove.quotient.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas),
      })
      .then((response) => ({
        response,
        tokenAddress: token.address,
        spenderAddress: spender,
      }))
      .catch((error: Error) => {
        logFailure(error)
        throw error
      })
  }, [approvalState, token, tokenContract, amountToApprove, spender, tokenChainId])

  return [approvalState, approve]
}
