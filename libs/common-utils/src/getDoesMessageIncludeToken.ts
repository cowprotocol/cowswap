import { areAddressesEqual } from '@cowprotocol/cow-sdk'

const WORD_REGEX = /[0-9a-zA-Z]+/g

export function getDoesMessageIncludeToken(message: string, tokenAddress: string): string | null {
  const words = message.match(WORD_REGEX) ?? []

  return words.some((word) => areAddressesEqual(word, tokenAddress)) ? tokenAddress : null
}
