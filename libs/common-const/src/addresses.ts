import { SupportedChainId } from '@cowprotocol/cow-sdk'

export type AddressMap = { [chainId: number]: string }

const DEFAULT_NETWORKS = [SupportedChainId.MAINNET]

function constructSameAddressMap<T extends string>(
  address: T,
  additionalNetworks: SupportedChainId[] = []
): { [chainId: number]: T } {
  return DEFAULT_NETWORKS.concat(additionalNetworks).reduce<{ [chainId: number]: T }>((memo, chainId) => {
    memo[chainId] = address
    return memo
  }, {})
}

export const MULTICALL_ADDRESS: AddressMap = {
  ...constructSameAddressMap('0x1F98415757620B543A52E61c46B32eB19261F984', []),
  [SupportedChainId.GNOSIS_CHAIN]: '0x0f41c16b8ad27c11f181eca85f0941868c1297af',
  [SupportedChainId.SEPOLIA]: '0xD7F33bCdb21b359c8ee6F0251d30E94832baAd07', // from https://github.com/Uniswap/sdk-core/blob/5365ae4cd021ab53b94b0879ec6ceb6ad3ebdce9/src/addresses.ts#L51
}

export const ARGENT_WALLET_DETECTOR_ADDRESS: AddressMap = {
  [SupportedChainId.MAINNET]: '0xeca4B0bDBf7c55E9b7925919d03CbF8Dc82537E8',
}

export const ENS_REGISTRAR_ADDRESSES: AddressMap = {
  [SupportedChainId.MAINNET]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e',
  [SupportedChainId.SEPOLIA]: '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e', // from https://docs.ens.domains/ens-deployments
}
