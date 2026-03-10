import {
  AddressPerChain,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS as COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD,
  COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS as COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD,
  COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING,
  SupportedChainId,
} from '@cowprotocol/cow-sdk'

import { isBarnBackendEnv } from './environments'

// When in barn backend env, use staging contracts for MAINNET only; prod for all other chains.
// TODO: the condition should be removed once all backend services migrated to the new contracts
export const COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS: AddressPerChain = isBarnBackendEnv
  ? ({
      ...COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD,
      [SupportedChainId.MAINNET]: COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_STAGING[SupportedChainId.MAINNET],
    } as AddressPerChain)
  : (COW_PROTOCOL_SETTLEMENT_CONTRACT_ADDRESS_PROD as AddressPerChain)

// When in barn backend env, use the staging vault relayer for MAINNET only; prod for all other chains.
// TODO: the condition should be removed once all backend services migrated to the new contracts
export const COW_PROTOCOL_VAULT_RELAYER_ADDRESS: AddressPerChain = isBarnBackendEnv
  ? ({
      ...COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD,
      [SupportedChainId.MAINNET]: COW_PROTOCOL_VAULT_RELAYER_ADDRESS_STAGING[SupportedChainId.MAINNET],
    } as AddressPerChain)
  : (COW_PROTOCOL_VAULT_RELAYER_ADDRESS_PROD as AddressPerChain)
