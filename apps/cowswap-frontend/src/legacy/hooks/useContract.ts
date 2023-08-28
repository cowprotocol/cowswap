import { useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import {
  ArgentWalletDetector,
  EnsPublicResolver,
  EnsRegistrar,
  Erc20,
  Erc721,
  Erc1155,
  Weth,
  CoWSwapEthFlowJson,
  ArgentWalletDetectorAbi,
  Eip2612Abi,
  EnsPublicResolverAbi,
  EnsAbi,
  Erc20Abi,
  Erc20Bytes32Abi,
  Erc721Abi,
  Erc1155Abi,
  WethAbi,
  GPv2Settlement,
  GPv2SettlementAbi,
  UniswapInterfaceMulticallAbi,
  VCow,
  CoWSwapEthFlow,
  vCowAbi,
  UniswapInterfaceMulticall,
} from '@cowswap/abis'
import { Contract } from '@ethersproject/contracts'
import type { JsonRpcProvider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'

import {
  COWSWAP_ETHFLOW_CONTRACT_ADDRESS,
  GP_SETTLEMENT_CONTRACT_ADDRESS,
  V_COW_CONTRACT_ADDRESS,
} from 'legacy/constants'
import { ARGENT_WALLET_DETECTOR_ADDRESS, ENS_REGISTRAR_ADDRESSES, MULTICALL_ADDRESS } from 'legacy/constants/addresses'
import { WRAPPED_NATIVE_CURRENCY } from 'legacy/constants/tokens'
import { getContract } from 'legacy/utils'
import { isEns, isProd, isStaging } from 'legacy/utils/environments'

import { useWalletInfo } from 'modules/wallet'

const { abi: MulticallABI } = UniswapInterfaceMulticallAbi

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true
): T | null {
  const { provider } = useWeb3React()
  const { account, chainId } = useWalletInfo()

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
    chainId ? WRAPPED_NATIVE_CURRENCY[chainId]?.address : undefined,
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

export function useArgentWalletDetectorContract() {
  return useContract<ArgentWalletDetector>(ARGENT_WALLET_DETECTOR_ADDRESS, ArgentWalletDetectorAbi, false)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean) {
  return useContract<EnsRegistrar>(ENS_REGISTRAR_ADDRESSES, EnsAbi, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean) {
  return useContract<EnsPublicResolver>(address, EnsPublicResolverAbi, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, Erc20Bytes32Abi, withSignerIfPossible)
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress, Eip2612Abi, false)
}

export function useInterfaceMulticall() {
  return useContract<UniswapInterfaceMulticall>(MULTICALL_ADDRESS, MulticallABI, false) as UniswapInterfaceMulticall
}

const COWSWAP_ETHFLOW_ABI = CoWSwapEthFlowJson.abi

export function useEthFlowContract(): CoWSwapEthFlow | null {
  const { chainId } = useWalletInfo()

  const contractEnv = isProd || isStaging || isEns ? 'prod' : 'barn'

  const contractAddress = chainId ? COWSWAP_ETHFLOW_CONTRACT_ADDRESS[contractEnv][chainId] : undefined

  return useContract<CoWSwapEthFlow>(contractAddress, COWSWAP_ETHFLOW_ABI, true)
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
