import { useMemo } from 'react'

import {
  CoWSwapEthFlow,
  CoWSwapEthFlowAbi,
  Erc20,
  Erc20Abi,
  GPv2Settlement,
  GPv2SettlementAbi,
  VCow,
  vCowAbi,
  Weth,
  WethAbi,
} from '@cowprotocol/abis'
import {
  COWSWAP_ETHFLOW_CONTRACT_ADDRESS,
  V_COW_CONTRACT_ADDRESS,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/common-const'
import { getContract, isEns, isProd, isStaging } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'

const WETH_CONTRACT_ADDRESS_MAP = Object.fromEntries(
  Object.entries(WRAPPED_NATIVE_CURRENCIES).map(([chainId, token]) => [chainId, token.address]),
)

const contractEnv = isProd || isStaging || isEns ? 'prod' : 'barn'
export const COWSWAP_ETHFLOW_CONTRACT_ADDRESS_MAP = COWSWAP_ETHFLOW_CONTRACT_ADDRESS[contractEnv]

export type UseContractResult<T extends Contract = Contract> = {
  contract: T | null
  error: unknown | null
  loading: boolean
  chainId: SupportedChainId
}

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string | undefined | null } | undefined,
  ABI: any,
  withSignerIfPossible = true,
  customProvider?: Web3Provider,
): UseContractResult<T> {
  const defaultProvider = useWalletProvider()
  const { account, chainId } = useWalletInfo()
  const provider = customProvider || defaultProvider

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider) {
      // Loading, waiting for chain or some basic information to instantiate the contract
      return {
        contract: null,
        error: null,
        chainId,
        loading: true,
      }
    }

    // Get the address for the contract
    const address = typeof addressOrAddressMap === 'string' ? addressOrAddressMap : addressOrAddressMap[chainId]

    if (!address) {
      // No address, no contract
      return {
        contract: null,
        error: null,
        chainId,
        loading: false,
      }
    }
    try {
      // Load and return the contract
      const contract = getContract(address, ABI, provider, withSignerIfPossible && account ? account : undefined)
      return {
        contract,
        error: null,
        chainId,
        loading: false,
      }
    } catch (error: any) {
      // Error getting the contract instance
      console.error('Failed to get contract', error)
      return {
        contract: null,
        error: error,
        chainId,
        loading: false,
      }
    }
  }, [addressOrAddressMap, ABI, provider, chainId, withSignerIfPossible, account]) as UseContractResult<T>
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
  return useContract<Erc20>(tokenAddress, Erc20Abi, withSignerIfPossible)
}

export function useWethContract(withSignerIfPossible?: boolean) {
  return useContract<Weth>(WETH_CONTRACT_ADDRESS_MAP, WethAbi, withSignerIfPossible)
}

export function useEthFlowContract(): UseContractResult<CoWSwapEthFlow> {
  return useContract<CoWSwapEthFlow>(COWSWAP_ETHFLOW_CONTRACT_ADDRESS_MAP, CoWSwapEthFlowAbi, true)
}

export function useGP2SettlementContract(): UseContractResult<GPv2Settlement> {
  return useContract<GPv2Settlement>(COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, GPv2SettlementAbi, true)
}

export function useVCowContract(): UseContractResult<VCow> {
  return useContract<VCow>(V_COW_CONTRACT_ADDRESS, vCowAbi, true)
}
