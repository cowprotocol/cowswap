import { OLD_BARN_ETH_FLOW_ADDRESS, STAGING_MIGRATED_CONTRACT_NETWORKS } from '@cowprotocol/common-const'
import {
  AddressPerChain,
  BARN_ETH_FLOW_ADDRESSES,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS as COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS as COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING,
  ETH_FLOW_ADDRESSES,
  mapAddressToSupportedNetworks,
} from '@cowprotocol/cow-sdk'

import { isBarnBackendEnv } from './environments'

// When in barn backend env, use staging contracts for MAINNET only; prod for all other chains.
// TODO: the condition should be removed once all backend services migrated to the new contracts
export const COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS: AddressPerChain = isBarnBackendEnv
  ? ({
      ...COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD,
      ...STAGING_MIGRATED_CONTRACT_NETWORKS.reduce((acc, chainId) => {
        acc[chainId] = COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING[chainId] as `0x${string}`
        return acc
      }, {} as AddressPerChain),
    } as AddressPerChain)
  : (COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD as AddressPerChain)

// When in barn backend env, use the staging vault relayer for MAINNET only; prod for all other chains.
// TODO: the condition should be removed once all backend services migrated to the new contracts
export const COW_PROTOCOL_VAULT_RELAYER_ADDRESS: AddressPerChain = isBarnBackendEnv
  ? ({
      ...COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD,
      ...STAGING_MIGRATED_CONTRACT_NETWORKS.reduce((acc, chainId) => {
        acc[chainId] = COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING[chainId] as `0x${string}`
        return acc
      }, {} as AddressPerChain),
    } as AddressPerChain)
  : (COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD as AddressPerChain)

// When in barn backend env, use the staging vault relayer for MAINNET only; prod for all other chains.
// TODO: the condition should be removed once all backend services migrated to the new contracts
export const COW_PROTOCOL_ETH_FLOW_ADDRESS: AddressPerChain = isBarnBackendEnv
  ? ({
      ...mapAddressToSupportedNetworks(OLD_BARN_ETH_FLOW_ADDRESS),
      ...STAGING_MIGRATED_CONTRACT_NETWORKS.reduce((acc, chainId) => {
        acc[chainId] = BARN_ETH_FLOW_ADDRESSES[chainId] as `0x${string}`
        return acc
      }, {} as AddressPerChain),
    } as AddressPerChain)
  : (ETH_FLOW_ADDRESSES as AddressPerChain)
