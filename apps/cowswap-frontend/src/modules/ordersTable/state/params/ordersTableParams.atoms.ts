import { atom } from 'jotai'

import { locationSearchParamsAtom } from 'common/state/routesState'

import { OrderTabId } from '../tabs/ordersTableTabs.constants'

// Orders table:
export const tabParamAtom = atom((get) => (get(locationSearchParamsAtom).get('tab') || OrderTabId.open) as OrderTabId)
export const pageParamAtom = atom((get) => parseInt(get(locationSearchParamsAtom).get('page') || '') || 1)
export const ordersTableParamsAtom = atom((get) => ({
  tab: get(tabParamAtom),
  page: get(pageParamAtom),
}))
