import { isAddress } from '@cowprotocol/common-utils'
import { AdditionalTargetChainId, isBtcAddress, isEvmChain, isSolanaAddress, TargetChainId } from '@cowprotocol/cow-sdk'

export interface AddressValidationStrategy {
  isValidAddress(value: string): boolean
  supportsENS: boolean
  placeholderKey: 'evm' | 'nonEvm'
  supportsChainPrefix: boolean
}

const evmStrategy: AddressValidationStrategy = {
  isValidAddress: (value: string) => Boolean(isAddress(value)),
  supportsENS: true,
  placeholderKey: 'evm',
  supportsChainPrefix: true,
}

const btcStrategy: AddressValidationStrategy = {
  isValidAddress: (value: string) => isBtcAddress(value),
  supportsENS: false,
  placeholderKey: 'nonEvm',
  supportsChainPrefix: false,
}

const solanaStrategy: AddressValidationStrategy = {
  isValidAddress: (value: string) => isSolanaAddress(value),
  supportsENS: false,
  placeholderKey: 'nonEvm',
  supportsChainPrefix: false,
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
  return evmStrategy
}
