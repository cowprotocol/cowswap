import { useCallback } from 'react'

import { Erc20 } from '@cowprotocol/abis'
import { calculateGasMargin, getIsNativeToken } from '@cowprotocol/common-utils'
import { BigNumber } from '@ethersproject/bignumber'
import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { useTokenContract } from './useContract'

import { GAS_LIMIT_DEFAULT } from '../constants/common'

export async function estimateApprove(
  tokenContract: Erc20,
  spender: string,
  amountToApprove: string,
): Promise<{
  approveAmount: BigNumber | string
  gasLimit: BigNumber
}> {
  try {
    return {
      approveAmount: MaxUint256,
      gasLimit: await tokenContract.estimateGas.approve(spender, MaxUint256),
    }
  } catch {
    // Fallback: Attempt to set an approval for the maximum wallet balance (instead of the MaxUint256).
    // Some tokens revert if you try to use more than what you have.
    try {
      const approveAmount = BigInt(amountToApprove).toString()

      return {
        approveAmount,
        gasLimit: await tokenContract.estimateGas.approve(spender, approveAmount),
      }
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error(
        '[useApproveCallbackMod] Error estimating gas for approval. Using default gas limit ' +
          GAS_LIMIT_DEFAULT.toString(),
        error,
      )

      return {
        approveAmount: MaxUint256,
        gasLimit: GAS_LIMIT_DEFAULT,
      }
    }
  }
}

// TODO: Reduce function complexity by extracting logic
// eslint-disable-next-line complexity
export function useApproveCallback(
  amountToApprove?: CurrencyAmount<Currency>,
  spender?: string,
): (summary?: string) => Promise<TransactionResponse | undefined> {
  const currency = amountToApprove?.currency
  const token = currency && !getIsNativeToken(currency) ? currency : undefined
  const { contract: tokenContract, chainId: tokenChainId } = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()
  const summary = amountToApprove?.greaterThan('0') ? `Approve ${token?.symbol}` : `Revoke ${token?.symbol} approval`
  const amountToApproveStr = amountToApprove ? '0x' + amountToApprove?.quotient.toString(16) : undefined

  return useCallback(async () => {
    if (!tokenChainId || !token || !tokenContract || !amountToApproveStr || !spender) {
      console.error('Wrong input for approve: ', { tokenChainId, token, tokenContract, amountToApproveStr, spender })
      return
    }

    const estimation = await estimateApprove(tokenContract, spender, amountToApproveStr)
    return tokenContract
      .approve(spender, estimation.approveAmount, {
        gasLimit: calculateGasMargin(estimation.gasLimit),
      })
      .then((response: TransactionResponse) => {
        addTransaction({
          hash: response.hash,
          summary,
          approval: { tokenAddress: token.address, spender, amount: amountToApproveStr },
        })
        return response
      })
  }, [tokenChainId, token, tokenContract, spender, addTransaction, summary, amountToApproveStr])
}
