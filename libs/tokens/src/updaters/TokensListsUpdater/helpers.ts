import ms from 'ms.macro'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokensState } from '../../state/tokens/tokensAtom'
import { ListsEnabledState, ListState } from '../../types'

type TokensAndListsUpdate = TokensState & {
  lists: { [id: string]: ListState }
}

const TOKENS_LISTS_UPDATER_INTERVAL = ms`6h`

export const LAST_UPDATE_TIME_KEY = (chainId: SupportedChainId) => `tokens-lists-updater:last-update-time[${chainId}]`

export const getIsTimeToUpdate = (chainId: SupportedChainId): boolean => {
  const lastUpdateTime = +(localStorage.getItem(LAST_UPDATE_TIME_KEY(chainId)) || 0)

  if (!lastUpdateTime) return true

  return Date.now() - lastUpdateTime > TOKENS_LISTS_UPDATER_INTERVAL
}

export const getFulfilledResults = (results: PromiseSettledResult<ListState>[]) => {
  return results.reduce<ListState[]>((acc, val) => {
    if (val.status === 'fulfilled') {
      acc.push(val.value)
    }

    return acc
  }, [])
}

// Spread tokens from fetched lists to active and inactive tokens lists
export function parseTokenListResults(chainId: SupportedChainId, fetchedTokens: ListState[]): TokensAndListsUpdate {
  return fetchedTokens.reduce<TokensAndListsUpdate>(
    (acc, val) => {
      const listId = val.id

      acc.lists[listId] = val

      return acc
    },
    { activeTokens: {}, inactiveTokens: {}, lists: {} }
  )
}

// Move tokens from active to inactive and vice versa
export function updateTokensLists(
  tokensState: TokensState,
  activeTokensListsMap: ListsEnabledState
): TokensState | null {
  const { activeTokens, inactiveTokens } = tokensState

  const activeLists = Object.keys(activeTokens)
  const inactiveLists = Object.keys(inactiveTokens)

  const areListsEmpty = !activeLists.length && !inactiveLists.length

  if (areListsEmpty) return null

  const noUpdates = Object.keys(activeTokensListsMap).every((listId) => {
    const isListEnabled = activeTokensListsMap[listId]

    if (typeof isListEnabled === 'undefined') return true

    return !!(isListEnabled ? activeTokens[listId] : inactiveTokens[listId])
  })

  if (noUpdates) return null

  return [...activeLists, ...inactiveLists].reduce<TokensState>(
    (state, listId) => {
      const isListEnabled = activeTokensListsMap[listId]

      if (isListEnabled) {
        // If list is enabled, move all tokens from inactive to active
        if (!state.activeTokens[listId]) {
          state.activeTokens[listId] = inactiveTokens[listId]
        }

        delete state.inactiveTokens[listId]
      } else {
        // If list is disabled, move all tokens from active to inactive
        if (!state.inactiveTokens[listId]) {
          state.inactiveTokens[listId] = activeTokens[listId]
        }

        delete state.activeTokens[listId]
      }

      return state
    },
    { ...tokensState }
  )
}
