import { isAddress } from '@cowprotocol/common-utils'
import {
  AdditionalTargetChainId,
  BTC_ADDRESS_PATTERN,
  isBtcAddress,
  isEvmChain,
  isSolanaAddress,
  SOL_ADDRESS_PATTERN,
  TargetChainId,
} from '@cowprotocol/cow-sdk'

export interface AddressValidationStrategy {
  isValidAddress(value: string): boolean
  supportsENS: boolean
  placeholderKey: 'evm' | 'solana' | 'bitcoin'
  supportsChainPrefix: boolean
  /** HTML input `pattern` attribute — covers all valid address/name formats for this network */
  pattern: string
}

const EVM_PATTERN_WITH_ENS = '^(0x[a-fA-F0-9]{40}|[a-zA-Z0-9][a-zA-Z0-9\\-.]*\\.eth)$'

const evmStrategy: AddressValidationStrategy = {
  isValidAddress: (value: string) => Boolean(isAddress(value)),
  supportsENS: true,
  placeholderKey: 'evm',
  supportsChainPrefix: true,
  pattern: EVM_PATTERN_WITH_ENS,
}

const btcStrategy: AddressValidationStrategy = {
  isValidAddress: (value: string) => isBtcAddress(value),
  supportsENS: false,
  placeholderKey: 'bitcoin',
  supportsChainPrefix: false,
  pattern: BTC_ADDRESS_PATTERN.source,
}

const solanaStrategy: AddressValidationStrategy = {
  isValidAddress: (value: string) => isSolanaAddress(value),
  supportsENS: false,
  placeholderKey: 'solana',
  supportsChainPrefix: false,
  pattern: SOL_ADDRESS_PATTERN.source,
}

export function getAddressValidationStrategy(targetChainId?: TargetChainId): AddressValidationStrategy {
  if (targetChainId === undefined || isEvmChain(targetChainId)) {
    return evmStrategy
  }
  if (targetChainId === AdditionalTargetChainId.BITCOIN) {
    return btcStrategy
  }
  if (targetChainId === AdditionalTargetChainId.SOLANA) {
    return solanaStrategy
  }
  // Unknown non-EVM chain: fall back to EVM validation.
  // If a new non-EVM chain is added, a dedicated strategy should be added above.
  return evmStrategy
}
