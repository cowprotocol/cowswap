// import { DEFAULT_ACTIVE_LIST_URLS } from './../../constants/lists'
import { createReducer } from '@reduxjs/toolkit'
import { getVersionUpgrade, VersionUpgrade } from '@uniswap/token-lists'
// import { DEFAULT_LIST_OF_LISTS } from '@src/constants/lists'
import { DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK } from 'constants/lists'
// import { updateVersion } from '../global/actions'
// import { acceptListUpdate, addList, fetchTokenList, removeList, enableList, disableList } from './actions'
import {
  acceptListUpdate,
  addList,
  fetchTokenList,
  removeList,
  enableList,
  disableList,
  initialiseTokenLists
} from './actions'

import { buildListState } from './helpers'

import { ListsState, NEW_LIST_STATE } from '@src/state/lists/reducer'

export * from '@src/state/lists/reducer'

// const initialState: ListsState = {
//   lastInitializedDefaultListOfLists: DEFAULT_LIST_OF_LISTS,
//   byUrl: {
//     ...DEFAULT_LIST_OF_LISTS.reduce<Mutable<ListsState['byUrl']>>((memo, listUrl) => {
//       memo[listUrl] = NEW_LIST_STATE
//       return memo
//     }, {})
//   },
//   activeListUrls: DEFAULT_ACTIVE_LIST_URLS
// }

const initialState: ListsState = buildListState({
  defaultActiveListUrls: [],
  defaultListofLists: [],
  newListState: NEW_LIST_STATE
})

export default createReducer(
  initialState,
  builder =>
    builder
      .addCase(fetchTokenList.pending, (state, { payload: { requestId, url } }) => {
        state.byUrl[url] = {
          current: null,
          pendingUpdate: null,
          ...state.byUrl[url],
          loadingRequestId: requestId,
          error: null
        }
      })
      // .addCase(fetchTokenList.fulfilled, (state, { payload: { requestId, tokenList, url } }) => {
      .addCase(fetchTokenList.fulfilled, (state, { payload: { requestId, tokenList, url, chainId } }) => {
        const current = state.byUrl[url]?.current
        const loadingRequestId = state.byUrl[url]?.loadingRequestId

        // no-op if update does nothing
        if (current) {
          const upgradeType = getVersionUpgrade(current.version, tokenList.version)

          if (upgradeType === VersionUpgrade.NONE) return
          if (loadingRequestId === null || loadingRequestId === requestId) {
            state.byUrl[url] = {
              ...state.byUrl[url],
              loadingRequestId: null,
              error: null,
              current: current,
              pendingUpdate: tokenList
            }
          }
        } else {
          // activate if on default active
          // if (DEFAULT_ACTIVE_LIST_URLS.includes(url)) {
          //   state.activeListUrls?.push(url)
          // }

          // TODO: should this default to MAINNET if no ChainID?
          const defaultActiveListsSet = chainId && new Set(DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK[chainId])
          const currentActiveListsSet = chainId && new Set(state.activeListUrls)
          // activate if on default active
          // TODO: should this default to MAINNET if no ChainID?
          if (defaultActiveListsSet?.has(url) && !currentActiveListsSet?.has(url)) {
            state.activeListUrls?.push(url)
          }

          state.byUrl[url] = {
            ...state.byUrl[url],
            loadingRequestId: null,
            error: null,
            current: tokenList,
            pendingUpdate: null
          }
        }
      })
      .addCase(fetchTokenList.rejected, (state, { payload: { url, requestId, errorMessage } }) => {
        if (state.byUrl[url]?.loadingRequestId !== requestId) {
          // no-op since it's not the latest request
          return
        }

        state.byUrl[url] = {
          ...state.byUrl[url],
          loadingRequestId: null,
          error: errorMessage,
          current: null,
          pendingUpdate: null
        }
      })
      .addCase(addList, (state, { payload: url }) => {
        if (!state.byUrl[url]) {
          state.byUrl[url] = NEW_LIST_STATE
        }
      })
      .addCase(removeList, (state, { payload: url }) => {
        if (state.byUrl[url]) {
          delete state.byUrl[url]
        }
        // remove list from active urls if needed
        if (state.activeListUrls && state.activeListUrls.includes(url)) {
          state.activeListUrls = state.activeListUrls.filter(u => u !== url)
        }
      })
      .addCase(enableList, (state, { payload: url }) => {
        if (!state.byUrl[url]) {
          state.byUrl[url] = NEW_LIST_STATE
        }

        if (state.activeListUrls && !state.activeListUrls.includes(url)) {
          state.activeListUrls.push(url)
        }

        if (!state.activeListUrls) {
          state.activeListUrls = [url]
        }
      })
      .addCase(disableList, (state, { payload: url }) => {
        if (state.activeListUrls && state.activeListUrls.includes(url)) {
          state.activeListUrls = state.activeListUrls.filter(u => u !== url)
        }
      })
      .addCase(acceptListUpdate, (state, { payload: url }) => {
        if (!state.byUrl[url]?.pendingUpdate) {
          throw new Error('accept list update called without pending update')
        }
        state.byUrl[url] = {
          ...state.byUrl[url],
          pendingUpdate: null,
          current: state.byUrl[url].pendingUpdate
        }
      })
      .addCase(
        initialiseTokenLists,
        (state, { payload: { byUrl, lastInitializedDefaultListOfLists, activeListUrls } }) => {
          state.byUrl = byUrl
          state.lastInitializedDefaultListOfLists = lastInitializedDefaultListOfLists
          state.activeListUrls = activeListUrls
        }
      )
  // .addCase(updateVersion, state => {
  //   // state loaded from localStorage, but new lists have never been initialized
  //   if (!state.lastInitializedDefaultListOfLists) {
  //     state.byUrl = initialState.byUrl
  //     state.activeListUrls = initialState.activeListUrls
  //   } else if (state.lastInitializedDefaultListOfLists) {
  //     const lastInitializedSet = state.lastInitializedDefaultListOfLists.reduce<Set<string>>(
  //       (s, l) => s.add(l),
  //       new Set()
  //     )
  //     const newListOfListsSet = DEFAULT_LIST_OF_LISTS.reduce<Set<string>>((s, l) => s.add(l), new Set())

  //     DEFAULT_LIST_OF_LISTS.forEach(listUrl => {
  //       if (!lastInitializedSet.has(listUrl)) {
  //         state.byUrl[listUrl] = NEW_LIST_STATE
  //       }
  //     })

  //     state.lastInitializedDefaultListOfLists.forEach(listUrl => {
  //       if (!newListOfListsSet.has(listUrl)) {
  //         delete state.byUrl[listUrl]
  //       }
  //     })
  //   }

  //   state.lastInitializedDefaultListOfLists = DEFAULT_LIST_OF_LISTS

  //   // if no active lists, activate defaults
  //   if (!state.activeListUrls) {
  //     state.activeListUrls = DEFAULT_ACTIVE_LIST_URLS

  //     // for each list on default list, initialize if needed
  //     DEFAULT_ACTIVE_LIST_URLS.map((listUrl: string) => {
  //       if (!state.byUrl[listUrl]) {
  //         state.byUrl[listUrl] = NEW_LIST_STATE
  //       }
  //       return true
  //     })
  //   }
  // })
)
