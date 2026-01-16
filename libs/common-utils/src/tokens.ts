import { NATIVE_CURRENCIES } from '@cowprotocol/common-const'
import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'

import { doesTokenMatchSymbolOrAddress } from './doesTokenMatchSymbolOrAddress'

export function isNativeAddress(tokenAddress: string, chainId: ChainId): boolean {
  if (!tokenAddress || !chainId) return false

  const tokenAddressLower = tokenAddress.toLowerCase()

  if (tokenAddressLower === 'eth') return true

  const native = NATIVE_CURRENCIES[chainId]

  return native && doesTokenMatchSymbolOrAddress(native, tokenAddressLower)
}

// further it will be a good point to have EvmAddressKey type and Solana/Bitcoin etc
// so this type it's kind of part of unition
export type AddressKey = `0x${string}`

export function getTokenAddressKey(address: string): AddressKey {
  return `${address.toLowerCase()}` as AddressKey
}

export interface TokenIdentifier {
  address: string
  chainId: number
}

// the same as for AddressKey - will be more complex when integrate solana/bitcoin
export type TokenId = `${number}:${AddressKey}`

export function getTokenId(token: TokenIdentifier): TokenId {
  return `${token.chainId}:${getTokenAddressKey(token.address)}`
}
