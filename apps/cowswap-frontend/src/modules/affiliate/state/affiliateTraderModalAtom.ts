import { atom } from 'jotai'

import { AffiliateEntrySource } from '../analytics/affiliateAnalytics.types'

export interface AffiliateTraderModalState {
  isOpen: boolean
  source?: AffiliateEntrySource
}

const INITIAL_MODAL_STATE: AffiliateTraderModalState = {
  isOpen: false,
}

export const affiliateTraderModalAtom = atom<AffiliateTraderModalState>(INITIAL_MODAL_STATE)

export const openTraderModalAtom = atom(null, (_get, set, source: AffiliateEntrySource) => {
  set(affiliateTraderModalAtom, { isOpen: true, source })
})

export const closeTraderModalAtom = atom(null, (_get, set) => {
  set(affiliateTraderModalAtom, INITIAL_MODAL_STATE)
})

export const toggleTraderModalAtom = atom(null, (get, set, source?: AffiliateEntrySource) => {
  const currentState = get(affiliateTraderModalAtom)

  set(
    affiliateTraderModalAtom,
    currentState.isOpen ? INITIAL_MODAL_STATE : { isOpen: true, source: source ?? currentState.source },
  )
})
