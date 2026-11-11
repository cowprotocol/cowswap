import 'server-only'

import { getAddress, parseAbi } from 'viem'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { getPublicClient } from '@/shared/lib/chain'

const UI_MULTIPLIER_ABI = parseAbi(['function uiMultiplier() view returns (uint256)'])
const UI_MULTIPLIER_DECIMALS = 18

/**
 * ERC-8056 `uiMultiplier()` of each token, keyed by `getAddressKey(address)`. Tokens whose multiplier can't be read
 * are left out
 */
export async function readUiMultipliers(
  chainId: number,
  tokens: { address: string }[],
): Promise<Record<string, number>> {
  const client = getPublicClient(chainId)

  if (!client || !tokens.length) return {}

  const responses = await client.multicall({
    contracts: tokens.map(({ address }) => ({
      address: getAddress(address),
      abi: UI_MULTIPLIER_ABI,
      functionName: 'uiMultiplier',
    })),
  })

  return Object.fromEntries(
    tokens.flatMap(({ address }, index) => {
      const response = responses[index]

      if (response?.status !== 'success') return []

      return [[getAddressKey(address), Number(response.result) / 10 ** UI_MULTIPLIER_DECIMALS] as const]
    }),
  )
}
