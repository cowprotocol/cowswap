import { SupportedChainId } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { ERC20_ABI, ERC4626_ABI } from './abis'
import { getPublicClient } from './client'

import { useNetworkId } from '../../state/network/hooks'

export interface VaultAsset {
  address: string
  symbol: string
  name: string
  decimals: number
}

export function useVaultAsset(vaultAddress: string): VaultAsset | undefined {
  const chainId = useNetworkId() as SupportedChainId | null

  const { data: assetAddress } = useSWR<string>(
    chainId && vaultAddress ? `vault-asset:${chainId}:${vaultAddress}` : null,
    () => {
      if (!chainId) throw new Error('missing chainId')
      return getPublicClient(chainId).readContract({
        address: vaultAddress as `0x${string}`,
        abi: ERC4626_ABI,
        functionName: 'asset',
      }) as Promise<string>
    },
  )

  const { data: symbol } = useSWR<string>(assetAddress ? `erc20-symbol:${chainId}:${assetAddress}` : null, () => {
    if (!chainId || !assetAddress) throw new Error('missing chainId or assetAddress')
    return getPublicClient(chainId).readContract({
      address: assetAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'symbol',
    }) as Promise<string>
  })

  const { data: name } = useSWR<string>(assetAddress ? `erc20-name:${chainId}:${assetAddress}` : null, () => {
    if (!chainId || !assetAddress) throw new Error('missing chainId or assetAddress')
    return getPublicClient(chainId).readContract({
      address: assetAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'name',
    }) as Promise<string>
  })

  const { data: decimals } = useSWR<number>(assetAddress ? `erc20-decimals:${chainId}:${assetAddress}` : null, () => {
    if (!chainId || !assetAddress) throw new Error('missing chainId or assetAddress')
    return getPublicClient(chainId).readContract({
      address: assetAddress as `0x${string}`,
      abi: ERC20_ABI,
      functionName: 'decimals',
    }) as Promise<number>
  })

  if (!assetAddress || !symbol || !name || decimals === undefined) return undefined
  return { address: assetAddress, symbol, name, decimals }
}
