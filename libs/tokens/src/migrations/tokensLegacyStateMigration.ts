import { ListsSourcesByNetwork, TokenListsState } from '../types'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { DEFAULT_TOKENS_LISTS } from '../const/tokensLists'

const MIGRATION_KEY = 'TOKENS_REFACTORING_MIGRATED'

export function tokensLegacyStateMigration() {
  // Run migration only once
  if (localStorage.getItem(MIGRATION_KEY)) return

  try {
    migrateLegacyTokensInUserState()
  } catch (error) {
    console.error('Cannot migrate LegacyTokensInUserState', error)
  }

  try {
    migrateLegacyTokenLists()
  } catch (error) {
    console.error('Cannot migrate LegacyTokenLists', error)
  }

  localStorage.setItem(MIGRATION_KEY, '1')
}

// Move user-added tokens from legacy redux store (UserState) to a new atom (userAddedTokensAtom)
// And purge the irrelevant localStorage state
function migrateLegacyTokensInUserState() {
  const userStateRaw = localStorage.getItem('redux_localstorage_simple_user')

  if (!userStateRaw) return

  const userState = JSON.parse(userStateRaw)

  if (userState?.tokens && Object.keys(userState.tokens).length > 0) {
    localStorage.setItem('userAddedTokensAtom:v1', JSON.stringify(userState.tokens))
  }

  // Cleanup legacy redux store (UserState)
  delete userState.favouriteTokens
  delete userState.tokens
  delete userState.pairs

  localStorage.setItem('redux_localstorage_simple_user', JSON.stringify(userState))
}

// Copy user-added lists from the legacy state to a new atom (userAddedListsSourcesAtom + listsStatesByChainAtom)
// And purge the irrelevant localStorage state
function migrateLegacyTokenLists() {
  const listsStateRaw = localStorage.getItem('redux_localstorage_simple_lists')

  if (!listsStateRaw) return

  const listsState = JSON.parse(listsStateRaw)

  const userAddedListsSources: ListsSourcesByNetwork = {
    [SupportedChainId.MAINNET]: [],
    [SupportedChainId.GNOSIS_CHAIN]: [],
    [SupportedChainId.GOERLI]: [],
  }

  const tokenListsState: TokenListsState = {
    [SupportedChainId.MAINNET]: {},
    [SupportedChainId.GNOSIS_CHAIN]: {},
    [SupportedChainId.GOERLI]: {},
  }

  Object.keys(listsState).forEach((chainIdStr) => {
    const networkLists = listsState[chainIdStr]

    if (!networkLists.byUrl) return

    const chainId = +chainIdStr as SupportedChainId
    const defaultLists = DEFAULT_TOKENS_LISTS[chainId]

    Object.keys(networkLists.byUrl).forEach((listSource) => {
      const list = networkLists.byUrl[listSource]

      if (!list || !list.current) return

      const isListInDefaults = defaultLists.find((defaultList) => defaultList.source === listSource)

      if (isListInDefaults) return

      userAddedListsSources[chainId].push({
        source: listSource,
      })

      tokenListsState[chainId][listSource] = {
        source: listSource,
        list: list.current,
        isEnabled: !!networkLists.activeListUrls?.includes(listSource),
      }
    })
  })

  localStorage.setItem('userAddedTokenListsAtom:v2', JSON.stringify(userAddedListsSources))
  localStorage.setItem('allTokenListsInfoAtom:v2', JSON.stringify(tokenListsState))

  localStorage.removeItem('redux_localstorage_simple_lists')
}
