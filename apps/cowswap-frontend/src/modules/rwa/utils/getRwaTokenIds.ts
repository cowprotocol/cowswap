import { getTokenId } from '@cowprotocol/cow-sdk'
import { ListState, RWA_TOKENS_LIST_SOURCES } from '@cowprotocol/tokens'

const RWA_LIST_SOURCES = new Set<string>(RWA_TOKENS_LIST_SOURCES)

export function getRwaTokenIds(lists: ListState[]): ReadonlySet<string> {
  const tokenIds = new Set<string>()

  lists.forEach((list) => {
    if (!RWA_LIST_SOURCES.has(list.source)) return

    list.list.tokens.forEach((token) => tokenIds.add(getTokenId(token)))
  })

  return tokenIds
}
