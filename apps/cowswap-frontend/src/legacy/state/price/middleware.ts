import { initialPriceLoadAnalytics } from '@cowprotocol/analytics'

import { Middleware, isAnyOf } from '@reduxjs/toolkit'

import * as PriceActions from './actions'

import { AppState } from '../index'

const isUpdateQuoteAction = isAnyOf(PriceActions.updateQuote)

export const priceMiddleware: Middleware<Record<string, unknown>, AppState> = (store) => (next) => (action) => {
  const state = store.getState()

  if (isUpdateQuoteAction(action)) {
    if (!state.price.initialQuoteLoaded) {
      // Send an event only on the first price load
      initialPriceLoadAnalytics()
    }
  }

  return next(action)
}
