import { createStore, Store } from 'redux'
import {
  /* DEFAULT_ACTIVE_LIST_URLS,  */ DEFAULT_LIST_OF_LISTS,
  DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK
} from 'constants/lists'
import { updateVersion } from 'state/global/actions'
import { fetchTokenList, acceptListUpdate, addList, removeList, enableList } from 'state/lists/actions'
import reducer, { ListsStateByNetwork } from '.'
import { ChainId } from '@uniswap/sdk'

const STUB_TOKEN_LIST = {
  name: '',
  timestamp: '',
  version: { major: 1, minor: 1, patch: 1 },
  tokens: []
}

const PATCHED_STUB_LIST = {
  ...STUB_TOKEN_LIST,
  version: { ...STUB_TOKEN_LIST.version, patch: STUB_TOKEN_LIST.version.patch + 1 }
}
const MINOR_UPDATED_STUB_LIST = {
  ...STUB_TOKEN_LIST,
  version: { ...STUB_TOKEN_LIST.version, minor: STUB_TOKEN_LIST.version.minor + 1 }
}
const MAJOR_UPDATED_STUB_LIST = {
  ...STUB_TOKEN_LIST,
  version: { ...STUB_TOKEN_LIST.version, major: STUB_TOKEN_LIST.version.major + 1 }
}

const EMPTY_STORE = {
  [ChainId.MAINNET]: {
    byUrl: {},
    activeListUrls: undefined
  },
  [ChainId.GÖRLI]: {
    byUrl: {},
    activeListUrls: undefined
  },
  [ChainId.KOVAN]: {
    byUrl: {},
    activeListUrls: undefined
  },
  [ChainId.RINKEBY]: {
    byUrl: {},
    activeListUrls: undefined
  },
  [ChainId.ROPSTEN]: {
    byUrl: {},
    activeListUrls: undefined
  },
  [ChainId.XDAI]: {
    byUrl: {},
    activeListUrls: undefined
  }
}

describe('list reducer', () => {
  let store: Store<ListsStateByNetwork>
  const getStoreSlice = (chainId: ChainId) => store.getState()[chainId]

  beforeEach(() => {
    store = createStore(reducer, EMPTY_STORE)
  })

  describe('fetchTokenList [MAINNET]', () => {
    // set what chain we're testing
    const CHAIN_ID = ChainId.MAINNET

    describe('pending', () => {
      it('sets pending', () => {
        store.dispatch(fetchTokenList.pending({ chainId: CHAIN_ID, requestId: 'request-id', url: 'fake-url' }))
        expect(getStoreSlice(CHAIN_ID)).toEqual({
          byUrl: {
            'fake-url': {
              error: null,
              loadingRequestId: 'request-id',
              current: null,
              pendingUpdate: null
            }
          },
          selectedListUrl: undefined
        })
      })

      it('does not clear current list', () => {
        store = createStore(reducer, {
          ...EMPTY_STORE,
          [CHAIN_ID]: {
            byUrl: {
              'fake-url': {
                error: null,
                current: STUB_TOKEN_LIST,
                pendingUpdate: null,
                loadingRequestId: null
              }
            },
            activeListUrls: undefined
          }
        })

        store.dispatch(fetchTokenList.pending({ requestId: 'request-id', url: 'fake-url' }))
        expect(getStoreSlice(CHAIN_ID)).toEqual({
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: 'request-id',
              pendingUpdate: null
            }
          },
          activeListUrls: undefined
        })
      })
    })

    describe('fulfilled', () => {
      it('saves the list', () => {
        store.dispatch(
          fetchTokenList.fulfilled({
            chainId: CHAIN_ID,
            tokenList: STUB_TOKEN_LIST,
            requestId: 'request-id',
            url: 'fake-url'
          })
        )
        expect(getStoreSlice(CHAIN_ID)).toEqual({
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: null
            }
          },
          activeListUrls: undefined
        })
      })

      it('does not save the list in pending if current is same', () => {
        store.dispatch(
          fetchTokenList.fulfilled({ tokenList: STUB_TOKEN_LIST, requestId: 'request-id', url: 'fake-url' })
        )
        store.dispatch(
          fetchTokenList.fulfilled({ tokenList: STUB_TOKEN_LIST, requestId: 'request-id', url: 'fake-url' })
        )
        expect(getStoreSlice(CHAIN_ID)).toEqual({
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: null
            }
          },
          activeListUrls: undefined
        })
      })

      it('does not save to current if list is newer patch version', () => {
        store.dispatch(
          fetchTokenList.fulfilled({ tokenList: STUB_TOKEN_LIST, requestId: 'request-id', url: 'fake-url' })
        )

        store.dispatch(
          fetchTokenList.fulfilled({ tokenList: PATCHED_STUB_LIST, requestId: 'request-id', url: 'fake-url' })
        )
        expect(getStoreSlice(CHAIN_ID)).toEqual({
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: PATCHED_STUB_LIST
            }
          },
          activeListUrls: undefined
        })
      })
      it('does not save to current if list is newer minor version', () => {
        store.dispatch(
          fetchTokenList.fulfilled({ tokenList: STUB_TOKEN_LIST, requestId: 'request-id', url: 'fake-url' })
        )

        store.dispatch(
          fetchTokenList.fulfilled({ tokenList: MINOR_UPDATED_STUB_LIST, requestId: 'request-id', url: 'fake-url' })
        )
        expect(getStoreSlice(CHAIN_ID)).toEqual({
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: MINOR_UPDATED_STUB_LIST
            }
          },
          activeListUrls: undefined
        })
      })
      it('does not save to pending if list is newer major version', () => {
        store.dispatch(
          fetchTokenList.fulfilled({ tokenList: STUB_TOKEN_LIST, requestId: 'request-id', url: 'fake-url' })
        )

        store.dispatch(
          fetchTokenList.fulfilled({ tokenList: MAJOR_UPDATED_STUB_LIST, requestId: 'request-id', url: 'fake-url' })
        )
        expect(getStoreSlice(CHAIN_ID)).toEqual({
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: MAJOR_UPDATED_STUB_LIST
            }
          },
          activeListUrls: undefined
        })
      })
    })

    describe('rejected', () => {
      it('no-op if not loading', () => {
        store.dispatch(fetchTokenList.rejected({ requestId: 'request-id', errorMessage: 'abcd', url: 'fake-url' }))
        expect(getStoreSlice(CHAIN_ID)).toEqual({
          byUrl: {},
          activeListUrls: undefined
        })
      })

      it('sets the error if loading', () => {
        store = createStore(reducer, {
          ...EMPTY_STORE,
          [CHAIN_ID]: {
            byUrl: {
              'fake-url': {
                error: null,
                current: null,
                loadingRequestId: 'request-id',
                pendingUpdate: null
              }
            },
            activeListUrls: undefined
          }
        })
        store.dispatch(fetchTokenList.rejected({ requestId: 'request-id', errorMessage: 'abcd', url: 'fake-url' }))
        expect(getStoreSlice(CHAIN_ID)).toEqual({
          byUrl: {
            'fake-url': {
              error: 'abcd',
              current: null,
              loadingRequestId: null,
              pendingUpdate: null
            }
          },
          activeListUrls: undefined
        })
      })
    })
  })

  describe('addList', () => {
    const CHAIN_ID = ChainId.MAINNET
    it('adds the list key to byUrl', () => {
      store.dispatch(addList({ url: 'list-id', chainId: CHAIN_ID }))
      expect(getStoreSlice(CHAIN_ID)).toEqual({
        byUrl: {
          'list-id': {
            error: null,
            current: null,
            loadingRequestId: null,
            pendingUpdate: null
          }
        },
        activeListUrls: undefined
      })
    })
    it('no op for existing list', () => {
      store = createStore(reducer, {
        ...EMPTY_STORE,
        [CHAIN_ID]: {
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: null
            }
          },
          activeListUrls: undefined
        }
      })
      store.dispatch(addList({ url: 'fake-url', chainId: CHAIN_ID }))
      expect(getStoreSlice(CHAIN_ID)).toEqual({
        byUrl: {
          'fake-url': {
            error: null,
            current: STUB_TOKEN_LIST,
            loadingRequestId: null,
            pendingUpdate: null
          }
        },
        activeListUrls: undefined
      })
    })
  })

  describe('acceptListUpdate', () => {
    const CHAIN_ID = ChainId.MAINNET
    it('swaps pending update into current', () => {
      store = createStore(reducer, {
        ...EMPTY_STORE,
        [CHAIN_ID]: {
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: PATCHED_STUB_LIST
            }
          },
          activeListUrls: undefined
        }
      })
      store.dispatch(acceptListUpdate({ url: 'fake-url', chainId: CHAIN_ID }))
      expect(getStoreSlice(CHAIN_ID)).toEqual({
        byUrl: {
          'fake-url': {
            error: null,
            current: PATCHED_STUB_LIST,
            loadingRequestId: null,
            pendingUpdate: null
          }
        },
        activeListUrls: undefined
      })
    })
  })

  describe('removeList', () => {
    const CHAIN_ID = ChainId.MAINNET
    it('deletes the list key', () => {
      store = createStore(reducer, {
        ...EMPTY_STORE,
        [CHAIN_ID]: {
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: PATCHED_STUB_LIST
            }
          },
          activeListUrls: undefined
        }
      })
      store.dispatch(removeList({ url: 'fake-url', chainId: CHAIN_ID }))
      expect(getStoreSlice(CHAIN_ID)).toEqual({
        byUrl: {},
        activeListUrls: undefined
      })
    })
    it('Removes from active lists if active list is removed', () => {
      store = createStore(reducer, {
        ...EMPTY_STORE,
        [CHAIN_ID]: {
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: PATCHED_STUB_LIST
            }
          },
          activeListUrls: ['fake-url']
        }
      })
      store.dispatch(removeList({ url: 'fake-url', chainId: CHAIN_ID }))
      expect(getStoreSlice(CHAIN_ID)).toEqual({
        byUrl: {},
        activeListUrls: []
      })
    })
  })

  describe('enableList', () => {
    const CHAIN_ID = ChainId.MAINNET
    it('enables a list url', () => {
      store = createStore(reducer, {
        ...EMPTY_STORE,
        [CHAIN_ID]: {
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: PATCHED_STUB_LIST
            }
          },
          activeListUrls: undefined
        }
      })
      store.dispatch(enableList({ url: 'fake-url', chainId: CHAIN_ID }))
      expect(getStoreSlice(CHAIN_ID)).toEqual({
        byUrl: {
          'fake-url': {
            error: null,
            current: STUB_TOKEN_LIST,
            loadingRequestId: null,
            pendingUpdate: PATCHED_STUB_LIST
          }
        },
        activeListUrls: ['fake-url']
      })
    })
    it('adds to url keys if not present already on enable', () => {
      store = createStore(reducer, {
        ...EMPTY_STORE,
        [CHAIN_ID]: {
          byUrl: {
            'fake-url': {
              error: null,
              current: STUB_TOKEN_LIST,
              loadingRequestId: null,
              pendingUpdate: PATCHED_STUB_LIST
            }
          },
          activeListUrls: undefined
        }
      })
      store.dispatch(enableList({ url: 'fake-url-invalid', chainId: CHAIN_ID }))
      expect(getStoreSlice(CHAIN_ID)).toEqual({
        byUrl: {
          'fake-url': {
            error: null,
            current: STUB_TOKEN_LIST,
            loadingRequestId: null,
            pendingUpdate: PATCHED_STUB_LIST
          },
          'fake-url-invalid': {
            error: null,
            current: null,
            loadingRequestId: null,
            pendingUpdate: null
          }
        },
        activeListUrls: ['fake-url-invalid']
      })
    })
    it('enable works if list already added', () => {
      store = createStore(reducer, {
        ...EMPTY_STORE,
        [CHAIN_ID]: {
          byUrl: {
            'fake-url': {
              error: null,
              current: null,
              loadingRequestId: null,
              pendingUpdate: null
            }
          },
          activeListUrls: undefined
        }
      })
      store.dispatch(enableList({ url: 'fake-url', chainId: CHAIN_ID }))
      expect(getStoreSlice(CHAIN_ID)).toEqual({
        byUrl: {
          'fake-url': {
            error: null,
            current: null,
            loadingRequestId: null,
            pendingUpdate: null
          }
        },
        activeListUrls: ['fake-url']
      })
    })
  })

  describe('updateVersion', () => {
    const CHAIN_ID = ChainId.MAINNET
    describe('never initialized', () => {
      beforeEach(() => {
        store = createStore(reducer, {
          ...EMPTY_STORE,
          [CHAIN_ID]: {
            byUrl: {
              'https://unpkg.com/@uniswap/default-token-list@latest/uniswap-default.tokenlist.json': {
                error: null,
                current: STUB_TOKEN_LIST,
                loadingRequestId: null,
                pendingUpdate: null
              },
              'https://unpkg.com/@uniswap/default-token-list@latest': {
                error: null,
                current: STUB_TOKEN_LIST,
                loadingRequestId: null,
                pendingUpdate: null
              }
            },
            activeListUrls: undefined
          }
        })
        store.dispatch(updateVersion({ chainId: CHAIN_ID }))
      })

      it('clears the current lists', () => {
        expect(
          getStoreSlice(CHAIN_ID).byUrl[
            'https://unpkg.com/@uniswap/default-token-list@latest/uniswap-default.tokenlist.json'
          ]
        ).toBeUndefined()
        expect(getStoreSlice(CHAIN_ID).byUrl['https://unpkg.com/@uniswap/default-token-list@latest']).toBeUndefined()
      })

      it('puts in all the new lists', () => {
        expect(Object.keys(getStoreSlice(CHAIN_ID).byUrl)).toEqual(DEFAULT_LIST_OF_LISTS)
      })
      it('all lists are empty', () => {
        const s = getStoreSlice(CHAIN_ID)
        Object.keys(s.byUrl).forEach(url => {
          expect(s.byUrl[url]).toEqual({
            error: null,
            current: null,
            loadingRequestId: null,
            pendingUpdate: null
          })
        })
      })
      it('sets initialized lists', () => {
        expect(getStoreSlice(CHAIN_ID).lastInitializedDefaultListOfLists).toEqual(DEFAULT_LIST_OF_LISTS)
      })
      it('sets selected list', () => {
        expect(getStoreSlice(CHAIN_ID).activeListUrls).toEqual(DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK[CHAIN_ID])
      })
    })
    describe('initialized with a different set of lists', () => {
      beforeEach(() => {
        store = createStore(reducer, {
          ...EMPTY_STORE,
          [CHAIN_ID]: {
            byUrl: {
              'https://unpkg.com/@uniswap/default-token-list@latest/uniswap-default.tokenlist.json': {
                error: null,
                current: STUB_TOKEN_LIST,
                loadingRequestId: null,
                pendingUpdate: null
              },
              'https://unpkg.com/@uniswap/default-token-list@latest': {
                error: null,
                current: STUB_TOKEN_LIST,
                loadingRequestId: null,
                pendingUpdate: null
              }
            },
            activeListUrls: undefined,
            lastInitializedDefaultListOfLists: ['https://unpkg.com/@uniswap/default-token-list@latest']
          }
        })
        store.dispatch(updateVersion({ chainId: CHAIN_ID }))
      })

      it('does not remove lists not in last initialized list of lists', () => {
        expect(
          getStoreSlice(CHAIN_ID).byUrl[
            'https://unpkg.com/@uniswap/default-token-list@latest/uniswap-default.tokenlist.json'
          ]
        ).toEqual({
          error: null,
          current: STUB_TOKEN_LIST,
          loadingRequestId: null,
          pendingUpdate: null
        })
      })
      it('removes lists in the last initialized list of lists', () => {
        expect(getStoreSlice(CHAIN_ID).byUrl['https://unpkg.com/@uniswap/default-token-list@latest']).toBeUndefined()
      })

      it('each of those initialized lists is empty', () => {
        const byUrl = getStoreSlice(CHAIN_ID).byUrl
        // note we don't expect the uniswap default list to be prepopulated
        // this is ok.
        Object.keys(byUrl).forEach(url => {
          if (url !== 'https://unpkg.com/@uniswap/default-token-list@latest/uniswap-default.tokenlist.json') {
            expect(byUrl[url]).toEqual({
              error: null,
              current: null,
              loadingRequestId: null,
              pendingUpdate: null
            })
          }
        })
      })

      it('sets initialized lists', () => {
        expect(getStoreSlice(CHAIN_ID).lastInitializedDefaultListOfLists).toEqual(DEFAULT_LIST_OF_LISTS)
      })
      it('sets default list to selected list', () => {
        expect(getStoreSlice(CHAIN_ID).activeListUrls).toEqual(DEFAULT_ACTIVE_LIST_URLS_BY_NETWORK[CHAIN_ID])
      })
    })
  })
})
