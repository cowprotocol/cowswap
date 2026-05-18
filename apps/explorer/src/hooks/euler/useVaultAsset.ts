import { AddressKey, EvmChains } from '@cowprotocol/cow-sdk'

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

type Erc20Meta = { symbol: string; name: string; decimals: number }
type MulticallEntry = { status: string; result?: unknown }

function resolveErc20Meta(data: MulticallEntry[] | undefined): Erc20Meta | undefined {
  if (!data) return undefined
  const [s, n, d] = data
  if (s?.status !== 'success' || n?.status !== 'success' || d?.status !== 'success') return undefined
  return { symbol: s.result as string, name: n.result as string, decimals: d.result as number }
}

export function useVaultAsset(vaultAddress: AddressKey): VaultAsset | undefined {
  const chainId = useNetworkId() as EvmChains | null

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

  const { data: erc20Data } = useSWR(assetAddress && chainId ? `erc20-meta:${chainId}:${assetAddress}` : null, () => {
    if (!chainId || !assetAddress) throw new Error('missing chainId or assetAddress')
    return getPublicClient(chainId).multicall({
      contracts: [
        { address: assetAddress as `0x${string}`, abi: ERC20_ABI, functionName: 'symbol' },
        { address: assetAddress as `0x${string}`, abi: ERC20_ABI, functionName: 'name' },
        { address: assetAddress as `0x${string}`, abi: ERC20_ABI, functionName: 'decimals' },
      ],
    })
  })

  const erc20Meta = resolveErc20Meta(erc20Data)
  if (!assetAddress || !erc20Meta) return undefined
  return { address: assetAddress, ...erc20Meta }
}
