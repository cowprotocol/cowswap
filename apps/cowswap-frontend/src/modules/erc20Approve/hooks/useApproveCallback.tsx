import { useCallback } from 'react'

import { calculateGasMargin, getIsNativeToken } from '@cowprotocol/common-utils'
import { Erc20 } from '@cowprotocol/cowswap-abis'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useLingui } from '@lingui/react/macro'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { GAS_LIMIT_DEFAULT } from 'common/constants/common'
import { useTokenContract } from 'common/hooks/useContract'

export async function estimateApprove(
  tokenContract: Erc20,
  spender: string,
  amountToApprove: bigint,
): Promise<{
  approveAmount: BigNumber | string
  gasLimit: BigNumber
}> {
  const approveAmount = amountToApprove.toString()

  try {
    return {
      approveAmount,
      gasLimit: await tokenContract.estimateGas.approve(spender, approveAmount),
    }
  } catch (error) {
    console.error(
      '[useApproveCallbackMod] Error estimating gas for approval. Using default gas limit ' +
        GAS_LIMIT_DEFAULT.toString(),
      error,
    )

    return {
      approveAmount,
      gasLimit: GAS_LIMIT_DEFAULT,
    }
  }
}

export function useApproveCallback(
  currency: Currency | undefined,
  spender?: string,
): (amountToApprove: CurrencyAmount<Currency> | bigint, summary?: string) => Promise<TransactionResponse | undefined> {
  const token = currency && !getIsNativeToken(currency) ? currency : undefined
  const { contract: tokenContract, chainId: tokenChainId } = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()
  const { t } = useLingui()

  return useCallback(
    async (amount: CurrencyAmount<Currency> | bigint) => {
      const amountToApprove = amount instanceof CurrencyAmount ? BigInt(amount.quotient.toString()) : amount
      const tokenSymbol = token?.symbol

      const summary = amountToApprove > 0n ? t`Approve ${tokenSymbol}` : t`Revoke ${tokenSymbol} approval`
      const amountToApproveStr = '0x' + amountToApprove.toString(16)

      if (!tokenChainId || !token || !tokenContract || !spender) {
        console.error('Wrong input for approve: ', { tokenChainId, token, tokenContract, amountToApproveStr, spender })
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
            summary,
            approval: { tokenAddress: token.address, spender, amount: amountToApproveStr },
          })
          return response
        })
    },
    [token, t, tokenChainId, tokenContract, spender, addTransaction],
  )
}
