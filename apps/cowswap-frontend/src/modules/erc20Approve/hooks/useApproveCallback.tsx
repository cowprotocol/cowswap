import { useCallback } from 'react'

import { calculateGasMargin, getIsNativeToken } from '@cowprotocol/common-utils'
import { Currency, CurrencyAmount, Token } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { type Address, erc20Abi } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { GAS_LIMIT_DEFAULT } from 'common/constants/common'

export async function estimateApprove(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  tokenAddress: Address,
  spender: string,
  amountToApprove: bigint,
  account: Address,
): Promise<{ gasLimit: bigint }> {
  try {
    const gasLimit = await publicClient.estimateContractGas({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spender as Address, amountToApprove],
      account,
    })
    return { gasLimit }
  } catch (error) {
    console.error(
      '[useApproveCallbackMod] Error estimating gas for approval. Using default gas limit ' +
        GAS_LIMIT_DEFAULT.toString(),
      error,
    )
    return { gasLimit: GAS_LIMIT_DEFAULT }
  }
}

export type ApproveTxResult = { hash: `0x${string}` }

export function useApproveCallback(
  currency: Currency | undefined,
  spender?: string,
): (amountToApprove: CurrencyAmount<Currency> | bigint, summary?: string) => Promise<ApproveTxResult | undefined> {
  const token: Token | undefined = currency && !getIsNativeToken(currency) ? (currency as Token) : undefined
  const { chainId: tokenChainId } = useWalletInfo()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const addTransaction = useTransactionAdder()
  const { t } = useLingui()

  return useCallback(
    async (amount: CurrencyAmount<Currency> | bigint) => {
      const amountToApprove = amount instanceof CurrencyAmount ? BigInt(amount.quotient.toString()) : amount
      const tokenSymbol = token?.symbol

      const summary = amountToApprove > 0n ? t`Approve ${tokenSymbol}` : t`Revoke ${tokenSymbol} approval`
      const amountToApproveStr = '0x' + amountToApprove.toString(16)

      if (!tokenChainId || !token || !publicClient || !walletClient?.account || !spender) {
        console.error('Wrong input for approve: ', { tokenChainId, token, amountToApproveStr, spender })
        return
      }

      const tokenAddress = token.address as Address
      const estimation = await estimateApprove(
        publicClient,
        tokenAddress,
        spender,
        amountToApprove,
        walletClient.account.address,
      )
      const hash = await walletClient.writeContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender as Address, amountToApprove],
        gas: calculateGasMargin(estimation.gasLimit),
        account: walletClient.account.address,
      })
      addTransaction({
        hash,
        summary,
        approval: { tokenAddress: token.address, spender, amount: amountToApproveStr },
      })
      return { hash }
    },
    [token, t, tokenChainId, publicClient, walletClient, spender, addTransaction],
  )
}
