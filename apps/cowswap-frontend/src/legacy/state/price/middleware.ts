import { Category, initGtm } from '@cowprotocol/analytics'

import { Middleware, isAnyOf } from '@reduxjs/toolkit'

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
        category: Category.TRADE,
        action: 'Initial Price estimation',
        nonInteraction: true,
      })
    }
  }

  return next(action)
}
