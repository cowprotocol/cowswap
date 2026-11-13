import { erc20Abi, getAddress } from 'viem'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import type { BalancesMap } from '../balances-watcher/balancesWatcherClient'

import { getPublicClient } from '@/shared/lib/chain'

// viem counts only the call data, 36 bytes per `balanceOf`: about 270 calls per `eth_call`
const MULTICALL_BATCH_SIZE_BYTES = 10_000

/** `balanceOf(owner)` of each token over RPC, tokens whose balance can't be read are left out */
export async function readTokenBalances(chainId: number, owner: string, addresses: string[]): Promise<BalancesMap> {
  const client = getPublicClient(chainId)

  if (!client) throw new Error(`No RPC for chain ${chainId}`)
  if (!addresses.length) return {}

  const account = getAddress(owner)
  const responses = await client.multicall({
    batchSize: MULTICALL_BATCH_SIZE_BYTES,
    contracts: addresses.map(
      (address) =>
        ({ address: getAddress(address), abi: erc20Abi, functionName: 'balanceOf', args: [account] }) as const,
    ),
  })

  return Object.fromEntries(
    addresses.flatMap((address, index) => {
      const response = responses[index]

      return response?.status === 'success' ? [[getAddressKey(address), response.result.toString()] as const] : []
    }),
  )
}
