import { shortenAddress } from '@cowprotocol/common-utils'

/**
 * Safely shortens an address, returning the original address if shortening fails
 * @param address The address to shorten
 * @returns The shortened address or original address if shortening fails
 */
export function safeShortenAddress(address: string): string {
  try {
    return shortenAddress(address)
  } catch {
    return address
  }
}
