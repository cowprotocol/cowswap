import { Currency, CurrencyAmount } from '@uniswap/sdk-core'
import { TransactionResponse } from '@ethersproject/providers'
import { useTokenContract } from 'legacy/hooks/useContract'
import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'
import { useCallback } from 'react'
import { calculateGasMargin } from 'legacy/utils/calculateGasMargin'
import { Erc20 } from 'legacy/abis/types'
import { BigNumber } from '@ethersproject/bignumber'
import { MaxUint256 } from '@ethersproject/constants'
import { APPROVE_GAS_LIMIT_DEFAULT } from 'legacy/hooks/useApproveCallback/useApproveCallbackMod'
import { useWalletInfo } from 'modules/wallet'

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
    // general fallback for tokens who restrict approval amounts
    try {
      const approveAmount = amountToApprove.quotient.toString()

      return {
        approveAmount,
        gasLimit: await tokenContract.estimateGas.approve(spender, approveAmount),
      }
    } catch (error: any) {
      console.error(
        '[useApproveCallbackMod] Error estimating gas for approval. Using default gas limit ' +
          APPROVE_GAS_LIMIT_DEFAULT.toString(),
        error
      )

      return {
        approveAmount: MaxUint256,
        gasLimit: APPROVE_GAS_LIMIT_DEFAULT,
      }
    }
  }
}

export function useApproveCallback(
  amountToApprove?: CurrencyAmount<Currency>,
  spender?: string
): (summary?: string) => Promise<TransactionResponse | undefined> {
  const { chainId } = useWalletInfo()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined
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
          summary: 'Approve ' + token.symbol,
          approval: { tokenAddress: token.address, spender },
        })
        return response
      })
  }, [chainId, token, tokenContract, amountToApprove, spender, addTransaction])
}
