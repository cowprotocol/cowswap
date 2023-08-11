import { atom } from 'jotai'

import { tradeFormValidationContextAtom } from './tradeFormValidationContextAtom'

import { validateTradeForm } from '../services/validateTradeForm'

export const tradeFormValidationAtom = atom((get) => {
  const context = get(tradeFormValidationContextAtom)

  if (!context) return null

  return validateTradeForm(context)
})
