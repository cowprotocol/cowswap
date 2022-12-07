import { Contract } from '@ethersproject/contracts'
import { JsonRpcProvider } from '@ethersproject/providers'

import {
  COWSWAP_ETHFLOW_CONTRACT_ADDRESS,
  GP_SETTLEMENT_CONTRACT_ADDRESS,
  V_COW_CONTRACT_ADDRESS,
} from 'constants/index'
import { SupportedChainId as ChainId } from 'constants/chains'

import { abi as COWSWAP_ETHFLOW_ABI } from '@cowprotocol/ethflowcontract/artifacts/CoWSwapEthFlow.sol/CoWSwapEthFlow.json'
import GPv2_SETTLEMENT_ABI from '@cow/abis/GPv2Settlement.json'
import V_COW_ABI from '@cow/abis/vCow.json'
import ENS_ABI from 'abis/ens-registrar.json'
import ERC20_ABI from 'abis/erc20.json'
import ERC20_BYTES32_ABI from 'abis/erc20_bytes32.json'
import { CoWSwapEthFlow, GPv2Settlement, VCow, Erc20 } from '@cow/abis/types'

import { useWeb3React } from '@web3-react/core'
import { getContract } from 'utils'

import { useContract } from '@src/hooks/useContract'
import { isEns, isProd, isStaging } from 'utils/environments'

export * from '@src/hooks/useContract'
export * from './useContractMod'

// Custom (non-MOD) hooks

export function useEthFlowContract(): CoWSwapEthFlow | null {
  const { chainId } = useWeb3React()

  const contractEnv = isProd || isStaging || isEns ? 'prod' : 'barn'

  const contractAddress = chainId ? COWSWAP_ETHFLOW_CONTRACT_ADDRESS[contractEnv][chainId] : undefined

  return useContract<CoWSwapEthFlow>(
    // TODO: get the networks.json when contracts deployed
    contractAddress,
    COWSWAP_ETHFLOW_ABI,
    true
  )
}

export function useGP2SettlementContract(): GPv2Settlement | null {
  const { chainId } = useWeb3React()
  return useContract<GPv2Settlement>(
    chainId ? GP_SETTLEMENT_CONTRACT_ADDRESS[chainId] : undefined,
    GPv2_SETTLEMENT_ABI,
    true
  )
}

export function useVCowContract() {
  const { chainId } = useWeb3React()
  return useContract<VCow>(chainId ? V_COW_CONTRACT_ADDRESS[chainId] : undefined, V_COW_ABI, true)
}

export function useENSRegistrarContract(withSignerIfPossible?: boolean): Contract | null {
  const { chainId } = useWeb3React()
  let address: string | undefined
  if (chainId) {
    switch (chainId) {
      case ChainId.MAINNET:
      case ChainId.GOERLI: // TODO: check this
        address = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e'
        break
      case ChainId.GNOSIS_CHAIN:
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
  provider?: JsonRpcProvider,
  account?: string,
  chainId?: ChainId
): T | null {
  if (!addressOrAddressMap || !ABI || !provider || !chainId) return null
  let address: string | undefined
  if (typeof addressOrAddressMap === 'string') address = addressOrAddressMap
  else address = addressOrAddressMap[chainId]
  if (!address) return null
  try {
    return getContract(address, ABI, provider, withSignerIfPossible && account ? account : undefined) as T
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
  provider?: JsonRpcProvider,
  account?: string,
  chainId?: ChainId
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
  chainId?: ChainId
): Contract | null {
  return _getContract(tokenAddress, ERC20_BYTES32_ABI, withSignerIfPossible, provider, account, chainId)
}
