import { useCallback } from 'react'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import { useLingui } from '@lingui/react/macro'
import { encodeFunctionData, erc20Abi, TransactionReceipt } from 'viem'
import { Config, useConfig } from 'wagmi'
import { estimateGas, writeContract, getTransactionReceipt } from 'wagmi/actions'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { GAS_LIMIT_DEFAULT } from 'common/constants/common'

export async function estimateApprove({
  tokenAddress,
  spender,
  amountToApprove,
  config,
}: {
  tokenAddress: string
  spender: string
  amountToApprove: bigint
  config: Config
}): Promise<{
  approveAmount: bigint
  gasLimit: bigint
}> {
  try {
    return {
      approveAmount: amountToApprove,
      gasLimit: await estimateGas(config, {
        to: tokenAddress,
        data: encodeFunctionData({ abi: erc20Abi, functionName: 'approve', args: [spender, amountToApprove] }),
      }),
    }
  } catch (error) {
    console.error(
      '[useApproveCallbackMod] Error estimating gas for approval. Using default gas limit ' +
        GAS_LIMIT_DEFAULT.toString(),
      error,
    )

    return {
      approveAmount: amountToApprove,
      gasLimit: GAS_LIMIT_DEFAULT,
    }
  }
}

export function useApproveCallback(
  currency: Currency | undefined,
  spender?: string,
): (amountToApprove: CurrencyAmount<Currency> | bigint, summary?: string) => Promise<TransactionReceipt | undefined> {
  const config = useConfig()
  const token = currency && !getIsNativeToken(currency) ? currency : undefined
  const addTransaction = useTransactionAdder()
  const { t } = useLingui()

  return useCallback(
    async (amount: CurrencyAmount<Currency> | bigint) => {
      const amountToApprove = amount instanceof CurrencyAmount ? BigInt(amount.quotient.toString()) : amount
      const tokenSymbol = token?.symbol

      const summary = amountToApprove > 0n ? t`Approve ${tokenSymbol}` : t`Revoke ${tokenSymbol} approval`
      const amountToApproveStr = '0x' + amountToApprove.toString(16)

      if (!token || !spender) {
        console.error('Wrong input for approve: ', { token, amountToApproveStr, spender })
        return
      }

      const estimation = await estimateApprove({ tokenAddress: token.address, spender, amountToApprove, config })
      const txHash = await writeContract(config, {
        abi: erc20Abi,
        address: token.address,
        functionName: 'approve',
        args: [spender, estimation.approveAmount],
        gas: estimation.gasLimit,
      })
      addTransaction({
        hash: txHash,
        summary,
        approval: { tokenAddress: token.address, spender, amount: amountToApproveStr },
      })
      return getTransactionReceipt(config, { hash: txHash })
    },
    [config, token, t, spender, addTransaction],
  )
}
