import { useCallback } from 'react'

import { Erc20 } from '@cowprotocol/abis'
import { calculateGasMargin, getIsNativeToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
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
  amountToApprove: CurrencyAmount<Currency>
): Promise<{
  approveAmount: BigNumber | string
  gasLimit: BigNumber
}> {
  try {
    return {
      approveAmount: MaxUint256,
      gasLimit: await tokenContract.estimateGas.approve(spender, MaxUint256),
    }
  } catch (e: any) {
    // Fallback: Attempt to set an approval for the maximum wallet balance (instead of the MaxUint256).
    // Some tokens revert if you try to use more than what you have.
    try {
      const approveAmount = amountToApprove.quotient.toString()

      return {
        approveAmount,
        gasLimit: await tokenContract.estimateGas.approve(spender, approveAmount),
      }
    } catch (error: any) {
      console.error(
        '[useApproveCallbackMod] Error estimating gas for approval. Using default gas limit ' +
          GAS_LIMIT_DEFAULT.toString(),
        error
      )

      return {
        approveAmount: MaxUint256,
        gasLimit: GAS_LIMIT_DEFAULT,
      }
    }
  }
}

export function useApproveCallback(
  amountToApprove?: CurrencyAmount<Currency>,
  spender?: string
): (summary?: string) => Promise<TransactionResponse | undefined> {
  const { chainId } = useWalletInfo()
  const currency = amountToApprove?.currency
  const token = currency && !getIsNativeToken(currency) ? currency : undefined
  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  return useCallback(async () => {
    if (!chainId || !token || !tokenContract || !amountToApprove || !spender) {
      console.error('Wrong input for approve: ', { chainId, token, tokenContract, amountToApprove, spender })
      return
    }

    const estimation = await estimateApprove(tokenContract, spender, amountToApprove)
    return tokenContract
      .approve(spender, estimation.approveAmount, {
        gasLimit: calculateGasMargin(estimation.gasLimit),
      })
      .then((response: TransactionResponse) => {
        addTransaction({
          hash: response.hash,
          summary: amountToApprove.greaterThan('0') ? `Approve ${token.symbol}` : `Revoke ${token.symbol} approval`,
          approval: { tokenAddress: token.address, spender, amount: '0x' + amountToApprove.quotient.toString(16) },
        })
        return response
      })
  }, [chainId, token, tokenContract, amountToApprove, spender, addTransaction])
}
