import { createStore } from 'jotai'

import { CompetitionOrderStatus } from '@cowprotocol/cow-sdk'

import {
  cancellationTrackedOrderIdsAtom,
  ordersProgressBarStateAtom,
  pruneOrdersProgressBarState,
  updateOrderProgressBarBackendInfo,
  updateOrderProgressBarCountdown,
  updateOrderProgressBarStepName,
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

describe('executing replay state', () => {
  const orderId = 'retry-order'
  const EXECUTING_STATUS = CompetitionOrderStatus.type.EXECUTING
  const OPEN_STATUS = CompetitionOrderStatus.type.OPEN

  it('marks the order to replay executing after the backend falls back from executing to open', () => {
    const store = createStore()

    store.set(ordersProgressBarStateAtom, {
      [orderId]: {
        backendApiStatus: EXECUTING_STATUS,
        progressBarStepName: OrderProgressBarStepName.EXECUTING,
      },
    })

    store.set(updateOrderProgressBarBackendInfo, { orderId, value: { backendApiStatus: OPEN_STATUS } })

    expect(store.get(ordersProgressBarStateAtom)[orderId]).toMatchObject({
      backendApiStatus: OPEN_STATUS,
      previousBackendApiStatus: EXECUTING_STATUS,
    })
    expect(store.get(ordersProgressBarStateAtom)[orderId]?.hasShownExecutingInCurrentAttempt).toBeUndefined()
  })

  it('keeps the attempt reset while the retry screen moves back to solving', () => {
    const store = createStore()

    store.set(ordersProgressBarStateAtom, {
      [orderId]: {
        progressBarStepName: OrderProgressBarStepName.SUBMISSION_FAILED,
        previousStepName: OrderProgressBarStepName.EXECUTING,
      },
    })

    store.set(updateOrderProgressBarStepName, { orderId, value: OrderProgressBarStepName.SOLVING })

    expect(store.get(ordersProgressBarStateAtom)[orderId]).toMatchObject({
      progressBarStepName: OrderProgressBarStepName.SOLVING,
      previousStepName: OrderProgressBarStepName.SUBMISSION_FAILED,
    })
    expect(store.get(ordersProgressBarStateAtom)[orderId]?.hasShownExecutingInCurrentAttempt).toBeUndefined()
  })

  it('marks the current attempt as having shown executing once step 3 appears', () => {
    const store = createStore()

    store.set(ordersProgressBarStateAtom, {
      [orderId]: {
        progressBarStepName: OrderProgressBarStepName.SOLVING,
        previousStepName: OrderProgressBarStepName.SUBMISSION_FAILED,
      },
    })

    store.set(updateOrderProgressBarStepName, { orderId, value: OrderProgressBarStepName.EXECUTING })

    expect(store.get(ordersProgressBarStateAtom)[orderId]).toMatchObject({
      progressBarStepName: OrderProgressBarStepName.EXECUTING,
      previousStepName: OrderProgressBarStepName.SOLVING,
      hasShownExecutingInCurrentAttempt: true,
    })
  })

  it('clears the attempt flag when the backend falls back from executing to open', () => {
    const store = createStore()

    store.set(ordersProgressBarStateAtom, {
      [orderId]: {
        backendApiStatus: EXECUTING_STATUS,
        hasShownExecutingInCurrentAttempt: true,
      },
    })

    store.set(updateOrderProgressBarBackendInfo, { orderId, value: { backendApiStatus: OPEN_STATUS } })

    expect(store.get(ordersProgressBarStateAtom)[orderId]?.hasShownExecutingInCurrentAttempt).toBeUndefined()
  })
})
