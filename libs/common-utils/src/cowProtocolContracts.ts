import {
  AddressPerChain,
  BARN_ETH_FLOW_ADDRESSES,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS as COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS as COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING,
  ETH_FLOW_ADDRESSES,
} from '@cowprotocol/cow-sdk'

import { isBarnBackendEnv } from './environments'

// When in barn backend env, use staging contracts for MAINNET only; prod for all other chains.
export const COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS: AddressPerChain = isBarnBackendEnv
  ? (COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING as AddressPerChain)
  : (COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD as AddressPerChain)

// When in barn backend env, use the staging vault relayer for MAINNET only; prod for all other chains.
export const COW_PROTOCOL_VAULT_RELAYER_ADDRESS: AddressPerChain = isBarnBackendEnv
  ? (COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING as AddressPerChain)
  : (COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD as AddressPerChain)

// When in barn backend env, use the staging vault relayer for MAINNET only; prod for all other chains.
export const COW_PROTOCOL_ETH_FLOW_ADDRESS: AddressPerChain = isBarnBackendEnv
  ? (BARN_ETH_FLOW_ADDRESSES as AddressPerChain)
  : (ETH_FLOW_ADDRESSES as AddressPerChain)
