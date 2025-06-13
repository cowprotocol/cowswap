import { getAddress } from '@ethersproject/address'

export const getChecksumAddressOrOriginal = (address: string): string => {
  try {
    return getAddress(address)
  } catch (error) {
    console.error('Failed to checksum address:', error);
    return address
  }
}

/**
 * Parses a string that may/may not contain an address and returns the `prefix` and checksummed `address`
 * @param value (prefixed) address
 * @returns `prefix` and checksummed `address`
 */
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const parsePrefixedAddress = (value: string) => {
  const [prefix, address] = value.split(':')

  return {
    prefix: prefix || undefined,
    address: getChecksumAddressOrOriginal(address || value),
  }
}

export const isPrefixedAddress = (value: string): boolean => {
  return value.includes(':')
}
