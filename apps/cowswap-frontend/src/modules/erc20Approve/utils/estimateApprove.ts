import { type Address, createPublicClient, erc20Abi, http, type PublicClient } from 'viem'

import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { delay } from '@cowprotocol/common-utils'
import { EvmChains } from '@cowprotocol/cow-sdk'

import { GAS_LIMIT_DEFAULT, MAX_WALLET_RETRIES, RETRY_BASE_DELAY_MS } from 'common/constants/common'

export async function estimateApprove(
  publicClient: PublicClient,
  tokenAddress: Address,
  spender: string,
  amountToApprove: bigint,
  account: Address,
  chainId: EvmChains,
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
  const rpcUrl = RPC_URLS[chainId]
  const chain = VIEM_CHAINS[chainId]

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
