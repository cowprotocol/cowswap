import { atom } from 'jotai'

import { Currency } from '@uniswap/sdk-core'

export interface TradeApproveState {
  approveInProgress: boolean
  currency?: Currency
  error?: string
}

export const tradeApproveStateAtom = atom<TradeApproveState>({ approveInProgress: false })

export const updateTradeApproveStateAtom = atom(null, (get, set, nextState: Partial<TradeApproveState>) => {
  set(tradeApproveStateAtom, () => {
    const prevState = get(tradeApproveStateAtom)

    return { ...prevState, ...nextState }
  })
})
