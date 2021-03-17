import { useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'

import { useActiveWeb3React } from '@src/hooks'

import { DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK, DEFAULT_LIST_OF_LISTS_BY_NETWORK } from 'constants/lists'
import { ListsState, Mutable, NEW_LIST_STATE } from './reducer'
import {
  buildKey,
  buildListState,
  _addNewTokenLists,
  _getCopyOfStorageLists,
  _removeStaleTokenLists,
  _updateState
} from './helpers'
import { useFullLists } from 'state/lists/hooks'

export default function NetworkListUpdater(): null {
  const { chainId } = useActiveWeb3React()
  const chainIdRef = useRef(chainId)

  const dispatch = useDispatch()

  const networkLists = useFullLists()

  // deal with changing of networks and saving the previous list state
  useEffect(() => {
    const previousListState = networkLists
    if (chainIdRef.current !== chainId) {
      // chain has changed, save previous
      console.debug('[Lists::Updater]::ChainId has changed. Prev: %s, Current: %s', chainIdRef.current, chainId)

      const storageKey = buildKey(chainIdRef.current)

      // only save state if we have a chainId
      if (chainIdRef.current) {
        _updateState({
          storageKey,
          state: previousListState
        })
      }
      // update our chainId ref
      chainIdRef.current = chainId
    }
  }, [chainId, networkLists])

  // Loading//Saving network specific lists from//into storage
  useEffect(() => {
    if (chainId) {
      let refreshedTokenState: Mutable<ListsState>
      // build identifier for storage token list e.g Rinkeby list identifier = "_4"
      const newChainKey = buildKey(chainId)
      // New token lists to compare against
      const newTokenLists = DEFAULT_LIST_OF_LISTS_BY_NETWORK[chainId]
      const newActiveListUrls = DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK[chainId]
      // Get the localStorage token list saved under identifer key
      // e.g "redux_localstorage_simple_lists_4"
      const tokenListsJSON = localStorage.getItem(newChainKey)

      if (tokenListsJSON) {
        refreshedTokenState = _getCopyOfStorageLists(tokenListsJSON)

        // we need to compare the lists and merge/cleanup
        // using the last initialised list as a comparison, we can initialise/remove
        if (refreshedTokenState.lastInitializedDefaultListOfLists) {
          // add any new token lists from DEFAULT_LISTS_OF_LISTS
          const newByUrlTokens = _addNewTokenLists({
            staleTokenLists: refreshedTokenState.byUrl,
            newTokenLists
          })
          // remove stale found in previous lastInitialisedListsOfLists
          const refreshedByUrlTokenLists = _removeStaleTokenLists({ staleTokenLists: newByUrlTokens, newTokenLists })

          // merge the lists
          refreshedTokenState = {
            ...refreshedTokenState,
            byUrl: {
              ...refreshedTokenState.byUrl,
              ...refreshedByUrlTokenLists
            }
          }
        }

        // if no active lists, activate defaults
        // if active token lists don't yet exist in byUrl, update
        if (!refreshedTokenState.activeListUrls) {
          refreshedTokenState.activeListUrls = newActiveListUrls

          const updatedFromActiveListUrls = _addNewTokenLists({
            staleTokenLists: refreshedTokenState.byUrl,
            newTokenLists: newActiveListUrls
          })

          refreshedTokenState = {
            ...refreshedTokenState,
            byUrl: {
              ...refreshedTokenState.byUrl,
              ...updatedFromActiveListUrls
            }
          }
        }

        // set our state's last initialised to the new list
        refreshedTokenState.lastInitializedDefaultListOfLists = newTokenLists
      } else {
        // clean slate, build defaults
        refreshedTokenState = buildListState({
          defaultActiveListUrls: DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK[chainId],
          defaultListofLists: DEFAULT_LIST_OF_LISTS_BY_NETWORK[chainId],
          newListState: NEW_LIST_STATE
        })
      }

      // Save everything
      _updateState({
        state: refreshedTokenState,
        storageKey: newChainKey,
        dispatch
      })
    }
  }, [chainId, dispatch])

  return null
}
