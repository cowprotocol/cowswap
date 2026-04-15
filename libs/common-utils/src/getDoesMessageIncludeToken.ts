import { getAddressKey } from '@cowprotocol/cow-sdk'

export function getDoesMessageIncludeToken(message: string, tokenAddress: string): string | null {
  if (message.toLowerCase().includes(getAddressKey(tokenAddress))) return tokenAddress

  return null
}
