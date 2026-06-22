import {
  AddressPerChain,
  BARN_ETH_FLOW_ADDRESSES,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS as COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS as COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD_SDK,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING,
  ETH_FLOW_ADDRESSES,
  isEvmChain,
} from '@cowprotocol/cow-sdk'

import { isBarnBackendEnv } from './environments'

// When in barn backend env, use staging contracts for MAINNET only; prod for all other chains.
export const COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS: AddressPerChain = isBarnBackendEnv
  ? (COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING as AddressPerChain)
  : (COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD as AddressPerChain)

// When in barn backend env, use the staging vault relayer for MAINNET only; prod for all other chains.
export const COW_PROTOCOL_VAULT_RELAYER_ADDRESS: AddressPerChain = isBarnBackendEnv
  ? (COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING as AddressPerChain)
  : (COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD_SDK as AddressPerChain)

// Production-only vault relayer, ignoring the barn backend env override.
// Use this when allowances must always target the production relayer
// regardless of the current environment (e.g. TWAP, which is always
// settled against the production settlement contract).
export const COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD: AddressPerChain =
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD_SDK as AddressPerChain

/**
 * ETH-Flow is the EVM-only wrapper that lets users sell native ETH (and equivalents)
 * through CoW Protocol. The SDK builds `ETH_FLOW_ADDRESSES` via `mapSupportedNetworks`,
 * which iterates every `SupportedChainId` — including non-EVM chains like Solana
 *
 * We strip non-EVM keys here so consumers only see chains where ETH-Flow exists.
 */
function pickEvmAddresses(addresses: AddressPerChain): AddressPerChain {
  return Object.fromEntries(
    Object.entries(addresses).filter(([chainId]) => isEvmChain(Number(chainId))),
  ) as AddressPerChain
}

// When in barn backend env, use the staging vault relayer for MAINNET only; prod for all other chains.
export const COW_PROTOCOL_ETH_FLOW_ADDRESS: AddressPerChain = pickEvmAddresses(
  isBarnBackendEnv ? (BARN_ETH_FLOW_ADDRESSES as AddressPerChain) : (ETH_FLOW_ADDRESSES as AddressPerChain),
)
