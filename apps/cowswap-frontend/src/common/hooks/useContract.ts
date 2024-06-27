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
import { V_COW_CONTRACT_ADDRESS, WRAPPED_NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { getContract, getEthFlowContractAddress } from '@cowprotocol/common-utils'
import { COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { useWalletProvider } from '@cowprotocol/wallet-provider'
import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'

// returns null on errors
export function useContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true,
  customProvider?: Web3Provider
): T | null {
  const defaultProvider = useWalletProvider()
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

export function useEthFlowContract(): CoWSwapEthFlow | null {
  const { chainId } = useWalletInfo()

  const contractAddress = getEthFlowContractAddress(chainId)

  return useContract<CoWSwapEthFlow>(contractAddress, CoWSwapEthFlowAbi, true)
}

export function useGP2SettlementContract(): GPv2Settlement | null {
  const { chainId } = useWalletInfo()
  return useContract<GPv2Settlement>(
    chainId ? COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId] : undefined,
    GPv2SettlementAbi,
    true
  )
}

export function useVCowContract() {
  const { chainId } = useWalletInfo()
  const vCowAddress = V_COW_CONTRACT_ADDRESS[chainId] || undefined

  return useContract<VCow>(vCowAddress, vCowAbi, true)
}
