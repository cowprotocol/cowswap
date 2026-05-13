import { AddressKey, SupportedChainId } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { ERC4626_ABI } from './abis'
import { getPublicClient } from './client'

import { useNetworkId } from '../../state/network/hooks'

export function useConvertToAssets(
  vaultAddress: AddressKey | undefined,
  shares: bigint | undefined,
): bigint | undefined {
  const chainId = useNetworkId() as SupportedChainId | null

  const { data } = useSWR<bigint>(
    chainId && vaultAddress && shares !== undefined
      ? `convert-to-assets:${chainId}:${vaultAddress}:${shares.toString()}`
      : null,
    () => {
      if (!chainId || !vaultAddress || shares === undefined) throw new Error('missing deps')
      return getPublicClient(chainId).readContract({
        address: vaultAddress as `0x${string}`,
        abi: ERC4626_ABI,
        functionName: 'convertToAssets',
        args: [shares],
      }) as Promise<bigint>
    },
  )

  return data
}
