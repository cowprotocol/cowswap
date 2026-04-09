import { useCallback } from 'react'

import { getRpcProvider } from '@cowprotocol/common-const'
import { calculateGasMargin, getIsNativeToken } from '@cowprotocol/common-utils'
import { Erc20 } from '@cowprotocol/cowswap-abis'
import { Currency, CurrencyAmount } from '@cowprotocol/currency'
import { BigNumber } from '@ethersproject/bignumber'
import { TransactionResponse } from '@ethersproject/providers'

import { useLingui } from '@lingui/react/macro'

import { useTransactionAdder } from 'legacy/state/enhancedTransactions/hooks'

import { GAS_LIMIT_DEFAULT, MAX_WALLET_RETRIES } from 'common/constants/common'
import { useTokenContract } from 'common/hooks/useContract'

let approveWalletFailCount = 3

async function estimateApproveGas(tokenContract: Erc20, spender: string, approveAmount: string): Promise<BigNumber> {
  if (approveWalletFailCount < MAX_WALLET_RETRIES) {
    try {
      const result = await tokenContract.estimateGas.approve(spender, approveAmount)
      approveWalletFailCount = 0
      return result
    } catch (error) {
      approveWalletFailCount++
      console.warn(`[estimateApproveGas] Wallet failed (${approveWalletFailCount}/${MAX_WALLET_RETRIES})`, error)
    }
  }
  console.log('[estimateApproveGas] Wallet fail limit reached switching to fallback provider')
  const { chainId } = await tokenContract.provider.getNetwork()
  const fallbackProvider = getRpcProvider(chainId)
  if (fallbackProvider) {
    try {
      const fallbackContract = tokenContract.connect(fallbackProvider) as Erc20
      return await fallbackContract.estimateGas.approve(spender, approveAmount)
    } catch (error) {
      console.warn('[estimateApproveGas] Fallback RPC failed', error)
    }
  }

  console.error(`[estimateApproveGas] All attempts failed, using default ${GAS_LIMIT_DEFAULT}`)
  return GAS_LIMIT_DEFAULT
}

export async function estimateApprove(
  tokenContract: Erc20,
  spender: string,
  amountToApprove: bigint,
): Promise<{
  approveAmount: BigNumber | string
  gasLimit: BigNumber
}> {
  const approveAmount = amountToApprove.toString()

  return {
    approveAmount,
    gasLimit: await estimateApproveGas(tokenContract, spender, approveAmount),
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
