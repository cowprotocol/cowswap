import { initGtm } from '@cowprotocol/analytics'

import { Middleware, isAnyOf } from '@reduxjs/toolkit'

import { CowSwapCategory } from 'common/analytics/types'


import * as PriceActions from './actions'

import { AppState } from '../index'

const isUpdateQuoteAction = isAnyOf(PriceActions.updateQuote)

const cowAnalytics = initGtm()

export const priceMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const state = store.getState()

  if (isUpdateQuoteAction(action)) {
    if (!state.price.initialQuoteLoaded) {
      // Send an event only on the first price load
      cowAnalytics.sendEvent({
        category: CowSwapCategory.TRADE,
        action: 'Initial Price estimation',
        nonInteraction: true,
      })
    }
  }

  return next(action)
}
