import { createStore } from 'jotai'

import {
  setCloseTradeConfirmAtom,
  setConfirmingTradeConfirmAtom,
  setOpenTradeConfirmAtom,
  tradeConfirmStateAtom,
} from './tradeConfirmStateAtom'

it('keeps a late confirmation from changing a newer modal', () => {
  const store = createStore()

  store.set(setOpenTradeConfirmAtom)
  const firstSessionId = store.get(tradeConfirmStateAtom).sessionId
  store.set(setCloseTradeConfirmAtom)
  store.set(setOpenTradeConfirmAtom)
  store.set(setConfirmingTradeConfirmAtom, {
    isConfirming: true,
    sessionId: store.get(tradeConfirmStateAtom).sessionId,
  })

  store.set(setConfirmingTradeConfirmAtom, { isConfirming: false, sessionId: firstSessionId })

  expect(store.get(tradeConfirmStateAtom).isConfirming).toBe(true)
})
