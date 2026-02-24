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

const WETH_CONTRACT_ADDRESS_MAP = Object.fromEntries(
  Object.entries(WRAPPED_NATIVE_CURRENCIES).map(([chainId, token]) => [chainId, token.address]),
)

export const ethFlowEnv: CowEnv = isProd || isStaging || isEns ? 'prod' : 'staging'

export type UseContractResult<T> = { abi: T; address: string; chainId: SupportedChainId }

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
