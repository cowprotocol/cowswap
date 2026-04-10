import { createStore } from 'jotai'

import {
  affiliateTraderModalAtom,
  closeTraderModalAtom,
  openTraderModalAtom,
  toggleTraderModalAtom,
} from './affiliateTraderModalAtom'

import { AffiliateEntrySource } from '../analytics/affiliateAnalytics.types'

describe('affiliateTraderModalAtom', () => {
  it('opens the trader modal with its entry source', () => {
    const store = createStore()

    store.set(openTraderModalAtom, AffiliateEntrySource.TRADER_PAGE_ONBOARD)

    expect(store.get(affiliateTraderModalAtom)).toEqual({
      isOpen: true,
      source: AffiliateEntrySource.TRADER_PAGE_ONBOARD,
    })
  })

  it('closes the trader modal back to its initial state', () => {
    const store = createStore()
    store.set(openTraderModalAtom, AffiliateEntrySource.TRADER_REWARDS_ROW)

    store.set(closeTraderModalAtom)

    expect(store.get(affiliateTraderModalAtom)).toEqual({ isOpen: false })
  })

  it('toggles the trader modal open and closed', () => {
    const store = createStore()

    store.set(toggleTraderModalAtom, AffiliateEntrySource.TRADER_PAGE_CODE_CARD)
    expect(store.get(affiliateTraderModalAtom)).toEqual({
      isOpen: true,
      source: AffiliateEntrySource.TRADER_PAGE_CODE_CARD,
    })

    store.set(toggleTraderModalAtom)
    expect(store.get(affiliateTraderModalAtom)).toEqual({ isOpen: false })
  })
})
