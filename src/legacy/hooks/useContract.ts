import { Contract } from '@ethersproject/contracts'
import UniswapInterfaceMulticallJson from '@uniswap/v3-periphery/artifacts/contracts/lens/UniswapInterfaceMulticall.sol/UniswapInterfaceMulticall.json'
import { useWeb3React } from '@web3-react/core'
import ARGENT_WALLET_DETECTOR_ABI from 'legacy/abis/argent-wallet-detector.json'
import EIP_2612 from 'legacy/abis/eip_2612.json'
import ENS_PUBLIC_RESOLVER_ABI from 'legacy/abis/ens-public-resolver.json'
import ENS_ABI from 'legacy/abis/ens-registrar.json'
import ERC20_ABI from 'legacy/abis/erc20.json'
import ERC20_BYTES32_ABI from 'legacy/abis/erc20_bytes32.json'
import ERC721_ABI from 'legacy/abis/erc721.json'
import ERC1155_ABI from 'legacy/abis/erc1155.json'
import { ArgentWalletDetector, EnsPublicResolver, EnsRegistrar, Erc20, Erc721, Erc1155, Weth } from 'legacy/abis/types'
import WETH_ABI from 'legacy/abis/weth.json'
import { ARGENT_WALLET_DETECTOR_ADDRESS, ENS_REGISTRAR_ADDRESSES, MULTICALL_ADDRESS } from 'constants/addresses'
import { WRAPPED_NATIVE_CURRENCY } from 'constants/tokens'
import { useMemo } from 'react'
import { UniswapInterfaceMulticall } from 'types/v3'
import { getContract } from 'utils'
import { useWalletInfo } from 'modules/wallet'
import { GPv2Settlement, VCow } from 'abis/types'
import { CoWSwapEthFlow } from 'abis/types/ethflow'
import { isEns, isProd, isStaging } from 'utils/environments'
import {
  COWSWAP_ETHFLOW_CONTRACT_ADDRESS,
  GP_SETTLEMENT_CONTRACT_ADDRESS,
  V_COW_CONTRACT_ADDRESS,
} from 'constants/index'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import type { JsonRpcProvider } from '@ethersproject/providers'
import CoWSwapEthFlowJson from '@cowprotocol/ethflowcontract/artifacts/CoWSwapEthFlow.sol/CoWSwapEthFlow.json'
import GPv2_SETTLEMENT_ABI from 'abis/GPv2Settlement.json'
import V_COW_ABI from 'abis/vCow.json'

const { abi: MulticallABI } = UniswapInterfaceMulticallJson

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
  return useContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible)
}

export function useWETHContract(withSignerIfPossible?: boolean) {
  const { chainId } = useWalletInfo()
  return useContract<Weth>(
    chainId ? WRAPPED_NATIVE_CURRENCY[chainId]?.address : undefined,
    WETH_ABI,
    withSignerIfPossible
  )
}

export function useERC721Contract(nftAddress?: string) {
  return useContract<Erc721>(nftAddress, ERC721_ABI, false)
}

export function useERC1155Contract(nftAddress?: string) {
  return useContract<Erc1155>(nftAddress, ERC1155_ABI, false)
}

export function useArgentWalletDetectorContract() {
  return useContract<ArgentWalletDetector>(ARGENT_WALLET_DETECTOR_ADDRESS, ARGENT_WALLET_DETECTOR_ABI, false)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean) {
  return useContract<EnsRegistrar>(ENS_REGISTRAR_ADDRESSES, ENS_ABI, withSignerIfPossible)
}

export function useENSResolverContract(address: string | undefined, withSignerIfPossible?: boolean) {
  return useContract<EnsPublicResolver>(address, ENS_PUBLIC_RESOLVER_ABI, withSignerIfPossible)
}

export function useBytes32TokenContract(tokenAddress?: string, withSignerIfPossible?: boolean): Contract | null {
  return useContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible)
}

export function useEIP2612Contract(tokenAddress?: string): Contract | null {
  return useContract(tokenAddress, EIP_2612, false)
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
    GPv2_SETTLEMENT_ABI,
    true
  )
}

export function useVCowContract() {
  const { chainId } = useWalletInfo()
  return useContract<VCow>(chainId ? V_COW_CONTRACT_ADDRESS[chainId] : undefined, V_COW_ABI, true)
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
  return _getContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible, provider, account, chainId)
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
  return _getContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible, provider, account, chainId)
}
