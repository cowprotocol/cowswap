import { ListResource } from '../types'
import { getTokenListSource } from './getTokenListSource'

export function getTokenListViewLink(source: ListResource): string {
  return `https://tokenlists.org/token-list?url=${getTokenListSource(source)}`
}
