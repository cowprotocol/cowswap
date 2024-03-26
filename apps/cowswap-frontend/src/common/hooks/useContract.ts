import { useMemo } from 'react'

import {
  CoWSwapEthFlow,
  CoWSwapEthFlowAbi,
  Eip2612Abi,
  Erc1155,
  Erc1155Abi,
  Erc20,
  Erc20Abi,
  Erc20Bytes32Abi,
  Erc721,
  Erc721Abi,
  GPv2Settlement,
  GPv2SettlementAbi,
  UniswapInterfaceMulticall,
  UniswapInterfaceMulticallAbi,
  VCow,
  vCowAbi,
  Weth,
  WethAbi,
} from '@cowprotocol/abis'
import {
  COWSWAP_ETHFLOW_CONTRACT_ADDRESS,
  GP_SETTLEMENT_CONTRACT_ADDRESS,
  MULTICALL_ADDRESS,
  V_COW_CONTRACT_ADDRESS,
  WRAPPED_NATIVE_CURRENCIES,
} from '@cowprotocol/common-const'
import { getContract, isEns, isProd, isStaging } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Contract } from '@ethersproject/contracts'
import type { JsonRpcProvider } from '@ethersproject/providers'
import { Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

const { abi: MulticallABI } = UniswapInterfaceMulticallAbi

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true,
  customProvider?: Web3Provider
): T | null {
  const { provider: defaultProvider } = useWeb3React()
  const { account, chainId } = useWalletInfo()
  const provider = customProvider || defaultProvider

  return useMemo(() => {
    if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
    let address: string | undefined
    if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
    else address = addressOrAddressMap[chainId]
    if (!address) return null
    try {
      return getContract(address, ABI, provider, withSignerIfPossible && account ? account : undefined)
    } catch (error: any) {
      console.error('Failed to get contract', error)
      return null
    }
  }, [addressOrAddressMap, ABI, provider, chainId, withSignerIfPossible, account]) as T
}

export function useTokenContract(tokenAddress?: string, withSignerIfPossible?: boolean) {
  return useContract<Erc20>(tokenAddress, Erc20Abi, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean) {
  const { chainId } = useWalletInfo()
  return useContract<Weth>(
    chainId ? WRAPPED_NATIVE_CURRENCIES[chainId]?.address : undefined,
    WethAbi,
    withSignerIfPossible
  )
}

export function useERC721Contract(nftAddress?: string) {
  return useContract<Erc721>(nftAddress, Erc721Abi, false)
}

export function useERC1155Contract(nftAddress?: string) {
  return useContract<Erc1155>(nftAddress, Erc1155Abi, false)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, Erc20Bytes32Abi, withSignerIfPossible)
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress, Eip2612Abi, false)
}

export function useInterfaceMulticall(customProvider?: Web3Provider) {
  return useContract<UniswapInterfaceMulticall>(
    MULTICALL_ADDRESS,
    MulticallABI,
    false,
    customProvider
  ) as UniswapInterfaceMulticall
}

export function useEthFlowContract(): CoWSwapEthFlow | null {
  const { chainId } = useWalletInfo()

  const contractEnv = isProd || isStaging || isEns ? 'prod' : 'barn'

  const contractAddress = chainId ? COWSWAP_ETHFLOW_CONTRACT_ADDRESS[contractEnv][chainId] : undefined

  return useContract<CoWSwapEthFlow>(contractAddress, CoWSwapEthFlowAbi, true)
}

export function useGP2SettlementContract(): GPv2Settlement | null {
  const { chainId } = useWalletInfo()
  return useContract<GPv2Settlement>(
    chainId ? GP_SETTLEMENT_CONTRACT_ADDRESS[chainId] : undefined,
    GPv2SettlementAbi,
    true
  )
}

export function useVCowContract() {
  const { chainId } = useWalletInfo()
  return useContract<VCow>(chainId ? V_COW_CONTRACT_ADDRESS[chainId] : undefined, vCowAbi, true)
}

/**
 * Non-hook version of useContract
 */
function _getContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true,
  provider?: JsonRpcProvider,
  account?: string,
  chainId?: SupportedChainId
): T | null {
  if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
  let address: string | undefined
  if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
  else address = addressOrAddressMap[chainId]
  if (!address) return null
  try {
    return getContract(address, ABI, provider, withSignerIfPossible && account ? account : undefined) as T
  } catch (error: any) {
    console.error('Failed to get contract', error)
    return null
  }
}

/**
 * Non-hook version of useTokenContract
 */
export function getTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean,
  provider?: JsonRpcProvider,
  account?: string,
  chainId?: SupportedChainId
): Erc20 | null {
  return _getContract<Erc20>(tokenAddress, Erc20Abi, withSignerIfPossible, provider, account, chainId)
}

/**
 * Non-hook version of useBytes32TokenContract
 */
export function getBytes32TokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean,
  provider?: JsonRpcProvider,
  account?: string,
  chainId?: SupportedChainId
): Contract | null {
  return _getContract(tokenAddress, Erc20Bytes32Abi, withSignerIfPossible, provider, account, chainId)
}
