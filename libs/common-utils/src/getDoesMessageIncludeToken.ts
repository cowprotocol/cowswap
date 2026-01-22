import { getTokenAddressKey } from './tokens'

export function getDoesMessageIncludeToken(message: string, tokenAddress: string): string | null {
  if (message.toLowerCase().includes(getTokenAddressKey(tokenAddress))) return tokenAddress

  return null
}
