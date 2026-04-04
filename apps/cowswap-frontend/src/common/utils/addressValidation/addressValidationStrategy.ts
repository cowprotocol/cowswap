import { isAddress } from '@cowprotocol/common-utils'
import { AdditionalTargetChainId, isBtcAddress, isEvmChain, isSolanaAddress, TargetChainId } from '@cowprotocol/cow-sdk'

export interface AddressValidationStrategy {
  isValidAddress(value: string): boolean
  supportsENS: boolean
  placeholderKey: 'evm' | 'nonEvm'
  supportsChainPrefix: boolean
  /** HTML input `pattern` attribute — covers all valid address/name formats for this network */
  pattern: string
}

// EVM hex address OR ENS name (*.eth, subdomains allowed)
const EVM_PATTERN = '^(0x[a-fA-F0-9]{40}|[a-zA-Z0-9][a-zA-Z0-9\\-.]*\\.eth)$'

// Legacy P2PKH/P2SH (Base58Check, 25-34 bytes) and Bech32/Bech32m (bc1…/BC1… — case-insensitive per BIP173).
// Mirrors the SDK's BTC_LEGACY_ADDRESS_PATTERN and BTC_BECH32_MAINNET_PATTERN exactly.
const BTC_PATTERN = '^([13][a-km-zA-HJ-NP-Z1-9]{24,33}|bc1[a-z0-9]{39,59}|BC1[A-Z0-9]{39,59})$'

// Base58-encoded 32-byte public key (no 0, O, I, l)
const SOL_PATTERN = '^[1-9A-HJ-NP-Za-km-z]{32,44}$'

const evmStrategy: AddressValidationStrategy = {
  isValidAddress: (value: string) => Boolean(isAddress(value)),
  supportsENS: true,
  placeholderKey: 'evm',
  supportsChainPrefix: true,
  pattern: EVM_PATTERN,
}

const btcStrategy: AddressValidationStrategy = {
  isValidAddress: (value: string) => isBtcAddress(value),
  supportsENS: false,
  placeholderKey: 'nonEvm',
  supportsChainPrefix: false,
  pattern: BTC_PATTERN,
}

const solanaStrategy: AddressValidationStrategy = {
  isValidAddress: (value: string) => isSolanaAddress(value),
  supportsENS: false,
  placeholderKey: 'nonEvm',
  supportsChainPrefix: false,
  pattern: SOL_PATTERN,
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
