import { atom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Location } from 'history'

import { hashHistory } from '../../common/constants/routes'

function getInitialLocation(): Location {
  if (typeof window === 'undefined') {
    return {
      key: '',
      pathname: '',
      search: '',
      hash: '',
      state: undefined,
    }
  }

  // We are using HashRouter, so we need to extract pathname and search from the hash:
  // e.g.: http://localhost/#/swap?tab=signing&page=1:
  // - hash: '#/swap?tab=signing&page=1'
  // - hashPathString: '/swap?tab=signing&page=1'
  // - pathname: '/swap'
  // - search: '?tab=signing&page=1'

  const hashPathString = window.location.hash.slice(1) || '/'
  const hashUrl = new URL(
    hashPathString.startsWith('/') ? hashPathString : `/${hashPathString}`,
    window.location.origin,
  )

  return {
    key: `INITIAL_LOCATION_KEY_${Date.now()}`,
    pathname: hashUrl.pathname,
    search: hashUrl.search,
    hash: '',
    state: undefined,
  }
}
export const locationAtom = atom<Location>(getInitialLocation())

locationAtom.onMount = (setAtom) => {
  setAtom(getInitialLocation())

  return hashHistory.listen((event) => {
    setAtom(event.location)
  })
}

export const locationPathnameAtom = atom((get) => {
  return get(locationAtom).pathname
})

// Segments:

export enum TabOrderTypes {
  SWAP = 'swap',
  LIMIT = 'limit',
  ADVANCED = 'advanced',
  YIELD = 'yield',
}

export const locationNetworkAtom = atom(
  (get) => (parseInt(get(locationPathnameAtom).split('/')[1]) || null) as SupportedChainId | null,
)
export const locationOrderTypeAtom = atom((get) => get(locationPathnameAtom).split('/')[2] as TabOrderTypes)

// Search:
export const locationSearchAtom = atom((get) => get(locationAtom).search)
export const locationSearchParamsAtom = atom((get) => new URLSearchParams(get(locationSearchAtom)))

// Orders table:

export enum OrderTabId {
  SIGNING = 'signing',
  OPEN = 'open',
  UNFILLABLE = 'unfillable',
  HISTORY = 'history',
}

export const tabParamAtom = atom((get) => (get(locationSearchParamsAtom).get('tab') || null) as OrderTabId | null)
export const pageParamAtom = atom((get) => parseInt(get(locationSearchParamsAtom).get('page') || '') || null)
