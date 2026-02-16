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

export type ContractData<T> = {
  abi: T
  address: string
}

export type UseContractResult<T> = {
  chainId: SupportedChainId
} & T

export type WethContractData = ContractData<typeof WethAbi>
export function useWethContractData(): UseContractResult<WethContractData> {
  const { chainId } = useWalletInfo()

  return {
    abi: WethAbi,
    address: WETH_CONTRACT_ADDRESS_MAP[chainId],
    chainId,
  }
}

export type EthFlowContractData = ContractData<typeof CoWSwapEthFlowAbi>
export function useEthFlowContractData(): UseContractResult<EthFlowContractData> {
  const { chainId } = useWalletInfo()

  const contractAddress = getEthFlowContractAddresses(ethFlowEnv, chainId)

  return {
    abi: CoWSwapEthFlowAbi,
    address: contractAddress,
    chainId,
  }
}

export type SettlementContractData = ContractData<typeof GPv2SettlementAbi>
export function useGP2SettlementContractData(): UseContractResult<SettlementContractData> {
  const { chainId } = useWalletInfo()

  return {
    abi: GPv2SettlementAbi,
    address: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS[chainId],
    chainId,
  }
}

export type VCowContractData = Omit<ContractData<typeof vCowAbi>, 'address'> & { address: string | null }
export function useVCowContractData(): UseContractResult<VCowContractData> {
  const { chainId } = useWalletInfo()

  return {
    abi: vCowAbi,
    address: V_COW_CONTRACT_ADDRESS[chainId],
    chainId,
  }
}
