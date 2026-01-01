import { createStore } from 'jotai'

import {
  cancellationTrackedOrderIdsAtom,
  ordersProgressBarStateAtom,
  pruneOrdersProgressBarState,
  updateOrderProgressBarCountdown,
} from './atoms'

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

describe('updateOrderProgressBarCountdown', () => {
  const orderId = '1'

  it('sets countdown when the value changes', () => {
    const store = createStore()
    const initialState: OrdersProgressBarState = {
      [orderId]: { progressBarStepName: OrderProgressBarStepName.SOLVING },
    }

    store.set(ordersProgressBarStateAtom, initialState)

    store.set(updateOrderProgressBarCountdown, { orderId, value: 10 })

    expect(store.get(ordersProgressBarStateAtom)).toEqual({
      [orderId]: { ...initialState[orderId], countdown: 10 },
    })
  })

  it('does not update state when countdown is already absent and set to null', () => {
    const store = createStore()
    const initialState: OrdersProgressBarState = {
      [orderId]: { progressBarStepName: OrderProgressBarStepName.SOLVING },
    }

    store.set(ordersProgressBarStateAtom, initialState)

    store.set(updateOrderProgressBarCountdown, { orderId, value: null })

    expect(store.get(ordersProgressBarStateAtom)).toBe(initialState)
  })

  it('removes countdown when set to null after being defined', () => {
    const store = createStore()
    const initialState: OrdersProgressBarState = {
      [orderId]: { progressBarStepName: OrderProgressBarStepName.SOLVING },
    }

    store.set(ordersProgressBarStateAtom, initialState)

    store.set(updateOrderProgressBarCountdown, { orderId, value: 5 })
    store.set(updateOrderProgressBarCountdown, { orderId, value: null })

    expect(store.get(ordersProgressBarStateAtom)).toEqual({
      [orderId]: { ...initialState[orderId] },
    })
  })

  it('does not update state when the countdown value stays the same', () => {
    const store = createStore()
    const initialState: OrdersProgressBarState = {
      [orderId]: { progressBarStepName: OrderProgressBarStepName.SOLVING },
    }

    store.set(ordersProgressBarStateAtom, initialState)

    store.set(updateOrderProgressBarCountdown, { orderId, value: 3 })
    const afterFirstUpdate = store.get(ordersProgressBarStateAtom)

    store.set(updateOrderProgressBarCountdown, { orderId, value: 3 })

    expect(store.get(ordersProgressBarStateAtom)).toBe(afterFirstUpdate)
  })

  it('ignores null updates for orders without state', () => {
    const store = createStore()

    store.set(ordersProgressBarStateAtom, {})

    store.set(updateOrderProgressBarCountdown, { orderId, value: null })

    expect(store.get(ordersProgressBarStateAtom)).toEqual({})
  })
})

describe('cancellationTrackedOrderIdsAtom', () => {
  it('returns ids with cancellationTriggered flag set', () => {
    const store = createStore()
    store.set(ordersProgressBarStateAtom, {
      a: { cancellationTriggered: true },
      b: {},
      c: { cancellationTriggered: true },
    })

    expect(store.get(cancellationTrackedOrderIdsAtom)).toEqual(['a', 'c'])
  })
})
