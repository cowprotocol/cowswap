import {
  AddressPerChain,
  BARN_ETH_FLOW_ADDRESSES,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS as _COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS as _COW_PROTOCOL_VAULT_RELAYER_ADDRESS,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING,
  ETH_FLOW_ADDRESSES,
  isEvmChain,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'

import { isBarnBackendEnv } from './environments'

// Production-only settlement, ignoring the barn backend env override.
// Use this when quoting/posting must always target production settlement
// (e.g. EOA TWAP funding orders — WatchTower only runs against prod).
export const COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD =
  _COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD as AddressPerChain

// Barn env uses the staging map. Linea always uses the staging contract while its orderbook host is barn.
export const COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS: AddressPerChain = withLineaBarnContract(
  isBarnBackendEnv
    ? (COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING as AddressPerChain)
    : COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING as AddressPerChain,
)

// Production-only vault relayer, ignoring the barn backend env override.
// Use this when allowances must always target the production relayer
// regardless of the current environment (e.g. TWAP, which is always
// settled against the production settlement contract).
export const COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD: AddressPerChain =
  _COW_PROTOCOL_VAULT_RELAYER_ADDRESS as AddressPerChain

// Barn env uses the staging map. Linea always uses the staging relayer while its orderbook host is barn.
export const COW_PROTOCOL_VAULT_RELAYER_ADDRESS: AddressPerChain = withLineaBarnContract(
  isBarnBackendEnv
    ? (COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING as AddressPerChain)
    : COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING as AddressPerChain,
)

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

// Temporary: Linea orderbook calls go to barn, which settles with the staging contracts.
function withLineaBarnContract(addresses: AddressPerChain, staging: AddressPerChain): AddressPerChain {
  const linea = staging[SupportedChainId.LINEA]
  if (linea === undefined) return addresses

  return { ...addresses, [SupportedChainId.LINEA]: linea }
}

// Barn env uses the staging map. Linea always uses the staging ETH-flow contract while its orderbook host is barn.
export const COW_PROTOCOL_ETH_FLOW_ADDRESS: AddressPerChain = withLineaBarnContract(
  pickEvmAddresses(
    isBarnBackendEnv ? (BARN_ETH_FLOW_ADDRESSES as AddressPerChain) : (ETH_FLOW_ADDRESSES as AddressPerChain),
  ),
  pickEvmAddresses(BARN_ETH_FLOW_ADDRESSES as AddressPerChain),
)
