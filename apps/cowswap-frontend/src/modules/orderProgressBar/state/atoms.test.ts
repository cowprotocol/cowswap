import { createStore } from 'jotai'

import { ordersProgressBarStateAtom, pruneOrdersProgressBarState } from './atoms'

import { OrderProgressBarStepName, OrdersProgressBarState } from '../types'

describe('pruneOrdersProgressBarState', () => {
  it('removes entries that are not tracked', () => {
    const store = createStore()
    const initialState: OrdersProgressBarState = {
      '1': { progressBarStepName: OrderProgressBarStepName.SOLVING },
      '2': { progressBarStepName: OrderProgressBarStepName.EXECUTING },
    }

    store.set(ordersProgressBarStateAtom, initialState)
    store.set(pruneOrdersProgressBarState, ['2'])

    expect(store.get(ordersProgressBarStateAtom)).toEqual({
      '2': initialState['2'],
    })
  })

  it('clears state when no tracked order ids are provided', () => {
    const store = createStore()
    const initialState: OrdersProgressBarState = {
      '1': { progressBarStepName: OrderProgressBarStepName.SOLVING },
    }

    store.set(ordersProgressBarStateAtom, initialState)
    store.set(pruneOrdersProgressBarState, [])

    expect(store.get(ordersProgressBarStateAtom)).toEqual({})
  })

  it('does not update state when all tracked orders are present', () => {
    const store = createStore()
    const initialState: OrdersProgressBarState = {
      '1': { progressBarStepName: OrderProgressBarStepName.SOLVING },
      '2': { progressBarStepName: OrderProgressBarStepName.EXECUTING },
    }

    store.set(ordersProgressBarStateAtom, initialState)

    store.set(pruneOrdersProgressBarState, ['1', '2'])

    expect(store.get(ordersProgressBarStateAtom)).toBe(initialState)
  })
})
