import { useMemo } from 'react'

import {
  getEthFlowContractAddresses,
  V_COW_CONTRACT_ADDRESS,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/common-const'
import { isEns, isProd, isStaging } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'
import { CoWSwapEthFlowAbi, GPv2SettlementAbi, vCowAbi, WethAbi } from '@cowprotocol/cowswap-abis'
import { useWalletInfo } from '@cowprotocol/wallet'

import { type Address, erc20Abi } from 'viem'
import { usePublicClient, useWalletClient } from 'wagmi'

const WETH_CONTRACT_ADDRESS_MAP = Object.fromEntries(
  Object.entries(WRAPPED_NATIVE_CURRENCIES).map(([chainId, token]) => [
    chainId,
    (token as unknown as { address: string }).address,
  ]),
)

export const ethFlowEnv: CowEnv = isProd || isStaging || isEns ? 'prod' : 'staging'

export type UseContractResult<T> = { abi: T; address: string; chainId: SupportedChainId }

/** Minimal stub for legacy useContract(address, abi, withContract). Returns contract data only; contract methods require viem/wagmi. */
export function useContract<TContract = null, TAbi = unknown>(
  address: string | undefined,
  abi: TAbi,
  _withContract?: boolean,
): UseContractResult<TAbi> & { contract: TContract | null } {
  const { chainId } = useWalletInfo()
  return useMemo(
    () => ({
      abi,
      address: address ?? '',
      chainId: chainId ?? (1 as SupportedChainId),
      contract: null,
    }),
    [address, abi, chainId],
  ) as UseContractResult<TAbi> & { contract: TContract | null }
}

export type WethContractData = UseContractResult<typeof WethAbi>
export function useWethContractData(): WethContractData {
  const { chainId } = useWalletInfo()

  return useMemo(
    () => ({
      abi: WethAbi,
      address: WETH_CONTRACT_ADDRESS_MAP[chainId],
      chainId,
    }),
    [chainId],
  )
}

export type EthFlowContractData = UseContractResult<typeof CoWSwapEthFlowAbi>
export function useEthFlowContractData(): EthFlowContractData {
  const { chainId } = useWalletInfo()

  const contractAddress = getEthFlowContractAddresses(ethFlowEnv, chainId)

  return useMemo(
    () => ({
      abi: CoWSwapEthFlowAbi,
      address: contractAddress,
      chainId,
    }),
    [contractAddress, chainId],
  )
}

export type SettlementContractData = UseContractResult<typeof GPv2SettlementAbi>
export function useGP2SettlementContractData(): SettlementContractData {
  const { chainId } = useWalletInfo()

  return useMemo(
    () => ({
      abi: GPv2SettlementAbi,
      address: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
      chainId,
    }),
    [chainId],
  )
}

export type VCowContractData = Omit<UseContractResult<typeof vCowAbi>, 'address'> & { address: string | null }
export function useVCowContractData(): VCowContractData {
  const { chainId } = useWalletInfo()

  return useMemo(
    () => ({
      abi: vCowAbi,
      address: V_COW_CONTRACT_ADDRESS[chainId],
      chainId,
    }),
    [chainId],
  )
}

/** ERC20 contract wrapper for viem: returns { contract, chainId } for token at address */
export function useTokenContract(tokenAddress: string | undefined): {
  contract: { allowance: (owner: string, spender: string) => Promise<bigint> } | null
  chainId: SupportedChainId | undefined
} {
  const { chainId } = useWalletInfo()
  const publicClient = usePublicClient()

  const contract = useMemo(() => {
    if (!tokenAddress || !chainId || !publicClient) return null
    const address = tokenAddress as Address
    return {
      allowance: (owner: string, spender: string) =>
        publicClient.readContract({
          address,
          abi: erc20Abi,
          functionName: 'allowance',
          args: [owner as Address, spender as Address],
        }),
    }
  }, [tokenAddress, chainId, publicClient])

  return useMemo(
    () => ({
      contract,
      chainId: chainId ?? undefined,
    }),
    [contract, chainId],
  )
}

/** vCow contract wrapper for viem: returns { contract, chainId } with swapAll, balanceOf, swappableBalanceOf */
export function useVCowContract(): {
  contract: {
    estimateGas: { swapAll: (params?: { from?: string }) => Promise<bigint> }
    swapAll: (params: { from: string; gasLimit: bigint }) => Promise<{ hash: `0x${string}` }>
    swappableBalanceOf: (account: string) => Promise<bigint>
    balanceOf: (account: string) => Promise<bigint>
  } | null
  chainId: SupportedChainId | undefined
} {
  const { chainId } = useWalletInfo()
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()
  const vCowAddress = chainId ? V_COW_CONTRACT_ADDRESS[chainId] : null

  const contract = useMemo(() => {
    if (!vCowAddress || !chainId || !publicClient || !walletClient) return null
    const address = vCowAddress as Address
    return {
      estimateGas: {
        swapAll: async (params?: { from?: string }) => {
          try {
            return await publicClient.estimateContractGas({
              address,
              abi: vCowAbi,
              functionName: 'swapAll',
              account: (params?.from ?? walletClient.account?.address) as Address,
            })
          } catch {
            return 0n
          }
        },
      },
      swapAll: async (params: { from: string; gasLimit: bigint }) => {
        const hash = await walletClient.writeContract({
          address,
          abi: vCowAbi,
          functionName: 'swapAll',
          account: params.from as Address,
          gas: params.gasLimit,
        })
        return { hash }
      },
      swappableBalanceOf: (account: string) =>
        publicClient.readContract({
          address,
          abi: vCowAbi,
          functionName: 'swappableBalanceOf',
          args: [account as Address],
        }),
      balanceOf: (account: string) =>
        publicClient.readContract({
          address,
          abi: vCowAbi,
          functionName: 'balanceOf',
          args: [account as Address],
        }),
    }
  }, [vCowAddress, chainId, publicClient, walletClient])

  return useMemo(
    () => ({
      contract,
      chainId: chainId ?? undefined,
    }),
    [contract, chainId],
  )
}
