import { RPC_URLS, VIEM_CHAINS } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'
import { createPublicClient, http } from 'viem'

import { orderBookApi } from '../../sdk/cowSdk'
import { useNetworkId } from '../../state/network/hooks'

const clientCache = new Map<number, ReturnType<typeof createPublicClient>>()

function getPublicClient(chainId: SupportedChainId) {
  if (!clientCache.has(chainId)) {
    clientCache.set(
      chainId,
      createPublicClient({
        chain: VIEM_CHAINS[chainId],
        transport: http(RPC_URLS[chainId]),
      }),
    )
  }
  return clientCache.get(chainId)!
}

const ERC4626_ABI = [
  { name: 'asset', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'address' }] },
  {
    name: 'convertToAssets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'shares', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

const ERC20_ABI = [
  { name: 'symbol', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'name', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'string' }] },
  { name: 'decimals', type: 'function', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
] as const

interface VaultAsset {
  address: string
  symbol: string
  name: string
  decimals: number
}

export function useVaultAsset(vaultAddress: string): VaultAsset | undefined {
  const chainId = useNetworkId() as SupportedChainId | null

  const { data: assetAddress } = useSWR<string>(
    chainId && vaultAddress ? `vault-asset:${chainId}:${vaultAddress}` : null,
    () =>
      getPublicClient(chainId!).readContract({
        address: vaultAddress as `0x${string}`,
        abi: ERC4626_ABI,
        functionName: 'asset',
      }) as Promise<string>,
  )

  const { data: symbol } = useSWR<string>(
    assetAddress ? `erc20-symbol:${chainId}:${assetAddress}` : null,
    () =>
      getPublicClient(chainId!).readContract({
        address: assetAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'symbol',
      }) as Promise<string>,
  )

  const { data: name } = useSWR<string>(
    assetAddress ? `erc20-name:${chainId}:${assetAddress}` : null,
    () =>
      getPublicClient(chainId!).readContract({
        address: assetAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'name',
      }) as Promise<string>,
  )

  const { data: decimals } = useSWR<number>(
    assetAddress ? `erc20-decimals:${chainId}:${assetAddress}` : null,
    () =>
      getPublicClient(chainId!).readContract({
        address: assetAddress as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'decimals',
      }) as Promise<number>,
  )

  if (!assetAddress || !symbol || !name || decimals === undefined) return undefined
  return { address: assetAddress, symbol, name, decimals }
}

const VAULT_BALANCE_ABI = [
  {
    name: 'maxWithdraw',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

const VAULT_DEBT_ABI = [
  {
    name: 'debtOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const

export function useConvertToAssets(
  vaultAddress: string | undefined,
  shares: bigint | undefined,
): bigint | undefined {
  const chainId = useNetworkId() as SupportedChainId | null

  const { data } = useSWR<bigint>(
    chainId && vaultAddress && shares !== undefined
      ? `convert-to-assets:${chainId}:${vaultAddress}:${shares.toString()}`
      : null,
    () =>
      getPublicClient(chainId!).readContract({
        address: vaultAddress as `0x${string}`,
        abi: ERC4626_ABI,
        functionName: 'convertToAssets',
        args: [shares!],
      }) as Promise<bigint>,
  )

  return data
}

export function useVaultBalance(vaultAddress: string | undefined, account: string | undefined): bigint | undefined {
  const chainId = useNetworkId() as SupportedChainId | null

  const { data } = useSWR<bigint>(
    chainId && vaultAddress && account ? `vault-balance:${chainId}:${vaultAddress}:${account}` : null,
    () =>
      getPublicClient(chainId!).readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_BALANCE_ABI,
        functionName: 'maxWithdraw',
        args: [account as `0x${string}`],
      }) as Promise<bigint>,
  )

  return data
}

export function useVaultDebt(vaultAddress: string | undefined, account: string | undefined): bigint | undefined {
  const chainId = useNetworkId() as SupportedChainId | null

  const { data } = useSWR<bigint>(
    chainId && vaultAddress && account ? `vault-debt:${chainId}:${vaultAddress}:${account}` : null,
    () =>
      getPublicClient(chainId!).readContract({
        address: vaultAddress as `0x${string}`,
        abi: VAULT_DEBT_ABI,
        functionName: 'debtOf',
        args: [account as `0x${string}`],
      }) as Promise<bigint>,
  )

  return data
}

export function useContractName(address: string): string | undefined {
  const chainId = useNetworkId() as SupportedChainId | null

  const { data } = useSWR<string>(
    chainId && address ? `contract-name:${chainId}:${address}` : null,
    () =>
      getPublicClient(chainId!).readContract({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'name',
      }) as Promise<string>,
    { onError: () => undefined },
  )

  return data
}

export function useNativePrice(tokenAddress: string | undefined): number | undefined {
  const chainId = useNetworkId() as SupportedChainId | null

  const { data } = useSWR<number>(
    chainId && tokenAddress ? `native-price:${chainId}:${tokenAddress}` : null,
    async () => {
      const result = await orderBookApi.getNativePrice(tokenAddress!, { chainId: chainId! })
      return result.price || 0
    },
  )

  return data
}
