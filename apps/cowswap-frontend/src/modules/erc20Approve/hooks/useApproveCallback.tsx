import { useCallback } from 'react'

import { type Address } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'

import { getIsNativeToken } from '@cowprotocol/common-utils'
import { isEvmChain } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Token } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { sendApproveTransaction } from '../utils/sendApproveTransaction'

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

      if (!isEvmChain(tokenChainId)) {
        console.error('Wrong chainId for approve: ', { tokenChainId, token, amountToApproveStr, spender })
        return
      }

      const tokenAddress = token.address as Address
      const hash = await sendApproveTransaction({
        publicClient,
        tokenAddress,
        spender,
        amount: amountToApprove,
        account: walletClient.account.address,
        chainId: tokenChainId,
        writeContract: (params) => walletClient.writeContract(params),
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
