import { Contract } from '@ethersproject/contracts'
import { Web3Provider } from '@ethersproject/providers'

import { GP_SETTLEMENT_CONTRACT_ADDRESS, V_COW_CONTRACT_ADDRESS } from 'constants/index'
import { SupportedChainId as ChainId } from 'constants/chains'

import GPv2_SETTLEMENT_ABI from 'abis/GPv2Settlement.json'
import V_COW_ABI from 'abis/vCow.json'
import ENS_ABI from 'abis/ens-registrar.json'
import ERC20_ABI from 'abis/erc20.json'
import ERC20_BYTES32_ABI from 'abis/erc20_bytes32.json'
import { Erc20, GPv2Settlement, VCow } from 'abis/types'

import useActiveWeb3React from 'hooks/useActiveWeb3React'
import { getContract } from 'utils'

import { useContract } from '@src/hooks/useContract'

export * from '@src/hooks/useContract'
export * from './useContractMod'

// Custom (non-MOD) hooks

export function useGP2SettlementContract(): GPv2Settlement | null {
  const { chainId } = useActiveWeb3React()
  return useContract<GPv2Settlement>(
    chainId ? GP_SETTLEMENT_CONTRACT_ADDRESS[chainId] : undefined,
    GPv2_SETTLEMENT_ABI,
    true
  )
}

export function useVCowContract() {
  const { chainId } = useActiveWeb3React()
  return useContract<VCow>(chainId ? V_COW_CONTRACT_ADDRESS[chainId] : undefined, V_COW_ABI, true)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useActiveWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.RINKEBY:
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
      case ChainId.XDAI:
        address = '0x25D2252Ec30de7830b6825D6b4A08E70a581cD6a'
        break
    }
  }
  return useContract(address, ENS_ABI, withSignerIfPossible)
}

/**
 * Non-hook version of useContract
 */
function _getContract<T extends Contract = Contract>(
  addressOrAddressMap: string | { [chainId: number]: string } | undefined,
  ABI: any,
  withSignerIfPossible = true,
  library?: Web3Provider,
  account?: string,
  chainId?: ChainId
): T | null {
  if (!addressOrAddressMap || !ABI || !library || !chainId) return null
  let address: string | undefined
  if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
  else address = addressOrAddressMap[chainId]
  if (!address) return null
  try {
    return getContract(address, ABI, library, withSignerIfPossible && account ? account : undefined) as T
  } catch (error) {
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
  library?: Web3Provider,
  account?: string,
  chainId?: ChainId
): Erc20 | null {
  return _getContract<Erc20>(tokenAddress, ERC20_ABI, withSignerIfPossible, library, account, chainId)
}

/**
 * Non-hook version of useBytes32TokenContract
 */
export function getBytes32TokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean,
  library?: Web3Provider,
  account?: string,
  chainId?: ChainId
): Contract | null {
  return _getContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible, library, account, chainId)
}
