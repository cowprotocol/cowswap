import { ListResource } from '../types'

export function getTokenListViewLink(source: ListResource): string {
  const url = 'ensName' in source ? source.ensName : source.url

  return `https://tokenlists.org/token-list?url=${url}`
}
