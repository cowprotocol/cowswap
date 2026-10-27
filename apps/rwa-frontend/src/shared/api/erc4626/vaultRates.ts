import 'server-only'

import { erc4626Abi, getAddress } from 'viem'

import { getAddressKey } from '@cowprotocol/cow-sdk'

import { getPublicClient } from '@/shared/lib/chain'

/**
 * Underlying asset units one vault share redeems for, keyed by `getAddressKey(address)`. Vault and asset must have the
 * same decimals. Vaults whose rate can't be read are left out
 */
export async function readVaultAssetsPerShare(
  chainId: number,
  vaults: { address: string; decimals: number }[],
): Promise<Record<string, number>> {
  const client = getPublicClient(chainId)

  if (!client || !vaults.length) return {}

  const responses = await client.multicall({
    contracts: vaults.map(({ address, decimals }) => ({
      address: getAddress(address),
      abi: erc4626Abi,
      functionName: 'convertToAssets',
      args: [10n ** BigInt(decimals)],
    })),
  })

  return Object.fromEntries(
    vaults.flatMap(({ address, decimals }, index) => {
      const response = responses[index]

      if (response?.status !== 'success') return []

      return [[getAddressKey(address), Number(response.result) / 10 ** decimals] as const]
    }),
  )
}
