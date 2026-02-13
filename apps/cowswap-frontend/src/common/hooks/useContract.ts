import { useMemo } from 'react'

import {
  getEthFlowContractAddresses,
  V_COW_CONTRACT_ADDRESS,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/common-const'
import { getContract, isEns, isProd, isStaging } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS, CowEnv, SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  CoWSwapEthFlow,
  CoWSwapEthFlowAbi,
  Erc20,
  Erc20Abi,
  GPv2SettlementAbi,
  VCow,
  vCowAbi,
  Weth,
  WethAbi,
} from '@cowprotocol/cowswap-abis'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Contract, ContractInterface } from '@ethersproject/contracts'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'

const WETH_CONTRACT_ADDRESS_MAP = Object.fromEntries(
  Object.entries(WRAPPED_NATIVE_CURRENCIES).map(([chainId, token]) => [chainId, token.address]),
)

export const ethFlowEnv: CowEnv = isProd || isStaging || isEns ? 'prod' : 'staging'

export type UseContractResult<T extends Contract = Contract> = {
  contract: T | null
  error: unknown | null
  loading: boolean
  chainId: SupportedChainId
}

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string | undefined | null } | undefined,
  ABI: ContractInterface,
  withSignerIfPossible = true,
  customProvider?: Web3Provider,
): UseContractResult<T> {
  // TODO M-6 COW-573
  // This flow will be reviewed and updated later, to include a wagmi alternative
  const defaultProvider = useWalletProvider() as JsonRpcProvider
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
    } catch (error) {
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

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): UseContractResult<Erc20> {
  return useContract<Erc20>(tokenAddress, Erc20Abi, withSignerIfPossible)
}

export function useWethContract(withSignerIfPossible?: boolean): UseContractResult<Weth> {
  return useContract<Weth>(WETH_CONTRACT_ADDRESS_MAP, WethAbi, withSignerIfPossible)
}

export function useEthFlowContract(): {
  result: UseContractResult<CoWSwapEthFlow>
} {
  const { chainId } = useWalletInfo()

  const contractAddress = getEthFlowContractAddresses(ethFlowEnv, chainId)

  return {
    result: useContract<CoWSwapEthFlow>(contractAddress, CoWSwapEthFlowAbi, true),
  }
}

export type SettlementContractData = {
  abi: typeof GPv2SettlementAbi
  address: string
  chainId: SupportedChainId
}

export function useGP2SettlementContractData(): SettlementContractData {
  const { chainId } = useWalletInfo()

  return {
    abi: GPv2SettlementAbi,
    address: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
    chainId,
  }
}

export function useVCowContract(): UseContractResult<VCow> {
  return useContract<VCow>(V_COW_CONTRACT_ADDRESS, vCowAbi, true)
}
