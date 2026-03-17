import { atom } from 'jotai'

import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { Location } from 'history'

import { hashHistory } from '../constants/routes'

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
  const { hash } = window.location
  const [pathname, search] = hash.substring(1).split('?')

  return {
    key: `INITIAL_LOCATION_KEY_${Date.now()}`,
    pathname,
    search,
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

export const tabParamAtom = atom((get) => (get(locationSearchParamsAtom).get('tab') || OrderTabId.OPEN) as OrderTabId)
export const pageParamAtom = atom((get) => parseInt(get(locationSearchParamsAtom).get('page') || '') || 1)
export const ordersTableParamsAtom = atom((get) => ({
  tab: get(tabParamAtom),
  page: get(pageParamAtom),
}))
