import {
  // DEFAULT_ACTIVE_LIST_URLS,
  DEFAULT_LIST_OF_LISTS_BY_NETWORK,
  DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK,
  DEFAULT_NETWORK_FOR_LISTS,
  UNSUPPORTED_LIST_URLS,
} from 'constants/lists'
import { createReducer } from '@reduxjs/toolkit'
import { getVersionUpgrade, VersionUpgrade } from '@uniswap/token-lists'
import { TokenList } from '@uniswap/token-lists/dist/types'
// import { DEFAULT_LIST_OF_LISTS } from '@src/constants/lists'
import { updateVersion } from 'state/global/actions'
import {
  acceptListUpdate,
  addList,
  fetchTokenList,
  removeList,
  enableList,
  disableList,
  addGpUnsupportedToken,
  removeGpUnsupportedToken,
} from 'state/lists/actions'
import { SupportedChainId as ChainId } from 'constants/chains'
import { getChainIdValues } from 'utils/misc'
import { UnsupportedToken } from 'api/gnosisProtocol'

// Mod: change state shape - adds network map
export type ListsStateByNetwork = {
  [chain in ChainId]: ListsState
}

export interface ListsState {
  readonly byUrl: {
    readonly [url: string]: {
      readonly current: TokenList | null
      readonly pendingUpdate: TokenList | null
      readonly loadingRequestId: string | null
      readonly error: string | null
    }
  }
  // this contains the default list of lists from the last time the updateVersion was called, i.e. the app was reloaded
  readonly lastInitializedDefaultListOfLists?: string[]

  // currently active lists
  readonly activeListUrls: string[] | undefined

  // unsupported tokens
  readonly gpUnsupportedTokens: UnsupportedToken
}

export type ListState = ListsState['byUrl'][string]

export const NEW_LIST_STATE: ListState = {
  error: null,
  current: null,
  loadingRequestId: null,
  pendingUpdate: null,
}

export type Mutable<T> = { -readonly [P in keyof T]: T[P] extends ReadonlyArray<infer U> ? U[] : T[P] }

// MOD: setInitialState sets each chainId state individually
const setInitialListState = (chainId: ChainId): ListsState => ({
  lastInitializedDefaultListOfLists: DEFAULT_LIST_OF_LISTS_BY_NETWORK[chainId],
  byUrl: {
    ...DEFAULT_LIST_OF_LISTS_BY_NETWORK[chainId]
      .concat(...UNSUPPORTED_LIST_URLS[chainId])
      .reduce<Mutable<ListsState['byUrl']>>((memo, listUrl) => {
        memo[listUrl] = NEW_LIST_STATE
        return memo
      }, {}),
  },
  activeListUrls: DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK[chainId],
  gpUnsupportedTokens: {},
})

// MOD: change the intiialState shape
// we make an object with each chainId pulled from ChainId enum
// into a list and reduced into a map
const initialState: ListsStateByNetwork = {
  ...getChainIdValues().reduce((memo, chainId) => {
    if (!memo[chainId]) {
      memo[chainId] = setInitialListState(chainId)
    }
    return memo
  }, {} as ListsStateByNetwork),
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(addGpUnsupportedToken, (baseState, { payload: { chainId = DEFAULT_NETWORK_FOR_LISTS, ...restToken } }) => {
      const state = baseState[chainId]
      state.gpUnsupportedTokens[restToken.address.toLowerCase()] = restToken
    })
    .addCase(removeGpUnsupportedToken, (baseState, { payload: { chainId = DEFAULT_NETWORK_FOR_LISTS, address } }) => {
      const state = baseState[chainId]
      delete state.gpUnsupportedTokens[address.toLowerCase()]
    })
    .addCase(
      fetchTokenList.pending,
      (baseState, { payload: { chainId = DEFAULT_NETWORK_FOR_LISTS, requestId, url } }) => {
        const state = baseState[chainId]
        state.byUrl[url] = {
          current: null,
          pendingUpdate: null,
          ...state.byUrl[url],
          loadingRequestId: requestId,
          error: null,
        }
      }
    )
    .addCase(
      fetchTokenList.fulfilled,
      (baseState, { payload: { chainId = DEFAULT_NETWORK_FOR_LISTS, requestId, tokenList, url } }) => {
        const state = baseState[chainId]
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
              pendingUpdate: tokenList,
            }
          }
        } else {
          // activate if on default active
          if (DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK[chainId].includes(url)) {
            state.activeListUrls?.push(url)
          }

          state.byUrl[url] = {
            ...state.byUrl[url],
            loadingRequestId: null,
            error: null,
            current: tokenList,
            pendingUpdate: null,
          }
        }
      }
    )
    .addCase(
      fetchTokenList.rejected,
      (baseState, { payload: { chainId = DEFAULT_NETWORK_FOR_LISTS, url, requestId, errorMessage } }) => {
        const state = baseState[chainId]
        if (state.byUrl[url]?.loadingRequestId !== requestId) {
          // no-op since it's not the latest request
          return
        }

        state.byUrl[url] = {
          ...state.byUrl[url],
          loadingRequestId: null,
          error: errorMessage,
          current: null,
          pendingUpdate: null,
        }
      }
    )
    .addCase(addList, (baseState, { payload: { chainId = DEFAULT_NETWORK_FOR_LISTS, url } }) => {
      const state = baseState[chainId]
      if (!state.byUrl[url]) {
        state.byUrl[url] = NEW_LIST_STATE
      }
    })
    .addCase(removeList, (baseState, { payload: { chainId = DEFAULT_NETWORK_FOR_LISTS, url } }) => {
      const state = baseState[chainId]
      if (state.byUrl[url]) {
        delete state.byUrl[url]
      }
      // remove list from active urls if needed
      if (state.activeListUrls && state.activeListUrls.includes(url)) {
        state.activeListUrls = state.activeListUrls.filter((u) => u !== url)
      }
    })
    .addCase(enableList, (baseState, { payload: { chainId = DEFAULT_NETWORK_FOR_LISTS, url } }) => {
      const state = baseState[chainId]
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
    .addCase(disableList, (baseState, { payload: { chainId = DEFAULT_NETWORK_FOR_LISTS, url } }) => {
      const state = baseState[chainId]
      if (state.activeListUrls && state.activeListUrls.includes(url)) {
        state.activeListUrls = state.activeListUrls.filter((u) => u !== url)
      }
    })
    .addCase(acceptListUpdate, (baseState, { payload: { chainId = DEFAULT_NETWORK_FOR_LISTS, url } }) => {
      const state = baseState[chainId]
      if (!state.byUrl[url]?.pendingUpdate) {
        throw new Error('accept list update called without pending update')
      }
      state.byUrl[url] = {
        ...state.byUrl[url],
        pendingUpdate: null,
        current: state.byUrl[url].pendingUpdate,
      }
    })
    .addCase(
      updateVersion,
      (baseState, { payload: { chainId = DEFAULT_NETWORK_FOR_LISTS } }): ListsStateByNetwork | void => {
        const state = baseState[chainId]
        // MOD: we need to check the localstrorage list shape against our schema as it has changed
        if (!state) return (baseState = initialState)

        // state loaded from localStorage, but new lists have never been initialized
        if (!state.lastInitializedDefaultListOfLists) {
          state.byUrl = initialState[chainId].byUrl
          state.activeListUrls = initialState[chainId].activeListUrls
        } else if (state.lastInitializedDefaultListOfLists) {
          const lastInitializedSet = state.lastInitializedDefaultListOfLists.reduce<Set<string>>(
            (s, l) => s.add(l),
            new Set()
          )
          const newListOfListsSet = DEFAULT_LIST_OF_LISTS_BY_NETWORK[chainId].reduce<Set<string>>(
            (s, l) => s.add(l),
            new Set()
          )

          DEFAULT_LIST_OF_LISTS_BY_NETWORK[chainId].forEach((listUrl) => {
            if (!lastInitializedSet.has(listUrl)) {
              state.byUrl[listUrl] = NEW_LIST_STATE
            }
          })

          state.lastInitializedDefaultListOfLists.forEach((listUrl) => {
            if (!newListOfListsSet.has(listUrl)) {
              delete state.byUrl[listUrl]
            }
          })
        }

        state.lastInitializedDefaultListOfLists = DEFAULT_LIST_OF_LISTS_BY_NETWORK[chainId]

        // if no active lists, activate defaults
        if (!state.activeListUrls) {
          state.activeListUrls = DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK[chainId]

          // for each list on default list, initialize if needed
          DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK[chainId].map((listUrl: string) => {
            if (!state.byUrl[listUrl]) {
              state.byUrl[listUrl] = NEW_LIST_STATE
            }
            return true
          })
        }

        if (!state.gpUnsupportedTokens) {
          state.gpUnsupportedTokens = {}
        }
      }
    )
)
