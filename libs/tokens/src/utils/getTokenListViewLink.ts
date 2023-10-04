import { TokenListSource } from '../types'

export function getTokenListViewLink(source: TokenListSource): string {
  const url = 'ensName' in source ? source.ensName : source.url

  return `https://tokenlists.org/token-list?url=${url}`
}
