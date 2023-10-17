import { ListResource } from '../types'

export function getTokenListSource(source: ListResource): string {
  return 'ensName' in source ? source.ensName : source.url
}
