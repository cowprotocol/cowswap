import { atom } from 'jotai'

import { Location } from 'history'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { hashHistory } from '../constants/routes'
import { TabOrderTypes } from 'modules/ordersTable/state/ordersTable.types'

export const locationAtom = atom<Location>({
  key: '',
  pathname: '',
  search: '',
  hash: '',
  state: undefined,
})

locationAtom.onMount = (setAtom) => {
  hashHistory.listen((event) => {
    setAtom(event.location)
  })
}

export const locationPathnameAtom = atom((get) => get(locationAtom).pathname)

// Segments:
export const locationNetworkAtom = atom((get) => (parseInt(get(locationAtom).pathname.split('/')[1]) || null) as SupportedChainId | null)
export const locationOrderTypeAtom = atom((get) => get(locationAtom).pathname.split('/')[2] as TabOrderTypes)

// TODO: Move TabOrderTypes to this module?

// Search:
export const locationSearchAtom = atom((get) => get(locationAtom).search)
export const locationSearchParamsAtom = atom((get) => new URLSearchParams(get(locationSearchAtom)))
