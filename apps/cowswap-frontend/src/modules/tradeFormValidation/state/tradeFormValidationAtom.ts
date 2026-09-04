import { atom } from 'jotai'

import { tradeFormValidationContextAtom } from './tradeFormValidationContextAtom'

import { validateTradeForm } from '../services/validateTradeForm'
import { TradeFormValidation } from '../types'

export const tradeFormValidationAtom = atom((get) => {
  const context = get(tradeFormValidationContextAtom)

  if (!context) return null

  // validateTradeForm only inspects state to report validation flags - it should never throw.
  // But it's a large, synchronous computation over many upstream hooks (approvals, account
  // proxy, ENS, quotes...), any of which could misbehave on an edge-case input (e.g. a
  // non-address recipient string). This read runs inside jotai's atom-update flush, so an
  // uncaught throw here doesn't just fail this one value - it aggregates into an AggregateError
  // that crashes the whole app (see the "endless recipient" crash). Block the trade form instead
  // of taking the app down with it.
  try {
    return validateTradeForm(context)
  } catch (error) {
    console.error('[TradeFormValidation] validateTradeForm threw unexpectedly', error)
    return [TradeFormValidation.QuoteErrors]
  }
})
