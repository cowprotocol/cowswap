import { useCallback } from 'react'

import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { calculateGasMargin, delay, getIsNativeToken } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Currency, CurrencyAmount, Token } from '@cowprotocol/currency'
import { useWalletInfo } from '@cowprotocol/wallet'

import { useLingui } from '@lingui/react/macro'
import { type Address, createPublicClient, erc20Abi, http } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { GAS_LIMIT_DEFAULT, MAX_WALLET_RETRIES, RETRY_BASE_DELAY_MS } from 'common/constants/common'

export async function estimateApprove(
  publicClient: NonNullable<ReturnType<typeof usePublicClient>>,
  tokenAddress: Address,
  spender: string,
  amountToApprove: bigint,
  account: Address,
  chainId: number,
): Promise<{ gasLimit: bigint }> {
  for (let attempt = 1; attempt <= MAX_WALLET_RETRIES; attempt++) {
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
      console.warn(`[estimateApproveGas] Wallet attempt ${attempt}/${MAX_WALLET_RETRIES} failed`, error)
      if (attempt < MAX_WALLET_RETRIES) {
        await delay(RETRY_BASE_DELAY_MS * 2 ** (attempt - 1))
      }
    }
  }

  console.log('[estimateApproveGas] Wallet retries exhausted, switching to fallback RPC provider')
  const rpcUrl = RPC_URLS[chainId as SupportedChainId]
  const chain = VIEM_CHAINS[chainId as SupportedChainId]

  if (rpcUrl && chain) {
    try {
      const fallbackClient = createPublicClient({ chain, transport: http(rpcUrl) })
      const gasLimit = await fallbackClient.estimateContractGas({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [spender as Address, amountToApprove],
        account,
      })
      return { gasLimit }
    } catch (error) {
      console.warn('[estimateApproveGas] Fallback RPC gas estimation failed', error)
    }
  }

  console.error(`[estimateApproveGas] All attempts failed, using default ${GAS_LIMIT_DEFAULT}`)
  return { gasLimit: GAS_LIMIT_DEFAULT }
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
        tokenChainId,
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
