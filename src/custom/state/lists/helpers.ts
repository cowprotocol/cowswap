import { unstable_batchedUpdates as batchedUpdates } from 'react-dom'
import { ChainId } from '@uniswap/sdk'
import { initialiseTokenLists } from './actions'
import { ListsState, ListState, Mutable, NEW_LIST_STATE } from './reducer'

export function buildListState({
  defaultListofLists,
  newListState,
  defaultActiveListUrls
}: {
  defaultListofLists: string[]
  newListState: ListState
  defaultActiveListUrls: string[]
}) {
  return {
    lastInitializedDefaultListOfLists: defaultListofLists,
    byUrl: {
      ...defaultListofLists.reduce<Mutable<ListsState['byUrl']>>((memo, listUrl) => {
        memo[listUrl] = newListState
        return memo
      }, {})
    },
    activeListUrls: defaultActiveListUrls
  }
}

const BASE_STORAGE_KEY = 'redux_localstorage_simple_lists'

export function buildKey(chainId?: ChainId) {
  const identifier = chainId ? `_${chainId}` : ''

  return BASE_STORAGE_KEY + identifier
}

export function _getCopyOfStorageLists(listJSON: string) {
  // We have a storage token list
  // but what if it differs from the defaults?
  const oldStorageList = JSON.parse(listJSON)
  // Make a copy of the previous storage list
  return Object.assign({}, oldStorageList)
}
interface TokenListsParams<T> {
  staleTokenLists: T
  newTokenLists: string[]
}

export function _removeStaleTokenLists({
  staleTokenLists,
  newTokenLists
}: TokenListsParams<Mutable<ListsState['byUrl']>>) {
  const newUrlsSet = new Set(newTokenLists)

  // for each list on default list, remove if needed
  const updatedByUrls = Object.keys(staleTokenLists).reduce((acc, oldUrl) => {
    if (!newUrlsSet.has(oldUrl)) {
      return acc
    }

    return staleTokenLists
  }, {} as typeof staleTokenLists)

  return updatedByUrls
}

export function _addNewTokenLists({ staleTokenLists, newTokenLists }: TokenListsParams<Mutable<ListsState['byUrl']>>) {
  const staleUrlsSet = new Set(Object.keys(staleTokenLists))

  // for each list on default list, initialize if needed
  const updatedByUrls = newTokenLists.reduce((acc, newUrl) => {
    if (!staleUrlsSet.has(newUrl)) {
      acc[newUrl] = NEW_LIST_STATE
    }
    return acc
  }, {} as typeof staleTokenLists)

  return {
    ...staleTokenLists,
    ...updatedByUrls
  }
}

export function _updateState({
  storageKey,
  state,
  dispatch
}: {
  storageKey: string
  state: ListsState
  dispatch?: React.Dispatch<any>
}) {
  return batchedUpdates(() => {
    // save chain aware tokens to localStorage and redux
    // if dispatch is falsy, skip initialising the lists
    dispatch && dispatch(initialiseTokenLists(state))
    localStorage.setItem(storageKey, JSON.stringify(state))
  })
}
