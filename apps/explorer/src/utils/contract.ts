import v1Networks from '@gnosis.pm/dex-contracts/networks.json'
import v2Networks from '@cowprotocol/contracts/networks.json'

import { Network } from 'types'

type ContractNetworkInfo = {
  [networkId: string]: { address: string }
}

type OptionalNetwork = Network | undefined

export function getContractAddressFromNetworkInfo(
  network: OptionalNetwork,
  networkInfo: ContractNetworkInfo,
): string | null {
  if (!network || !networkInfo[network]?.address) {
    return null
  }
  return networkInfo[network].address
}

type V2ContractNames = keyof typeof v2Networks

export function getGpV2ContractAddress(network: OptionalNetwork, contractName: V2ContractNames): string | null {
  return getContractAddressFromNetworkInfo(network, v2Networks[contractName])
}

export function getGpV1ContractAddress(network: OptionalNetwork): string {
  return getContractAddressFromNetworkInfo(network, v1Networks.BatchExchange) || ''
}
