import { atom } from 'jotai'

import { Location } from 'history'

import { hashHistory } from '../constants/routes'

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
export const locationSearchAtom = atom((get) => get(locationAtom).search)
export const locationSearchParamsAtom = atom((get) => new URLSearchParams(get(locationSearchAtom)))
