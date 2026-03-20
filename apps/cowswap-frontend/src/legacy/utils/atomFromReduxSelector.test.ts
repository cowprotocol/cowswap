import { createStore } from 'jotai'

import type { AppState } from 'legacy/state'

const mockRedux = {
  state: { counter: 0 },
  listeners: new Set<() => void>(),
}

jest.mock('legacy/state', () => ({
  cowSwapStore: {
    getState: () => mockRedux.state,
    subscribe: (listener: () => void) => {
      mockRedux.listeners.add(listener)
      return () => {
        mockRedux.listeners.delete(listener)
      }
    },
  },
}))

import { atomFromReduxSelector } from './atomFromReduxSelector'

function selectCounter(state: AppState): number {
  return (state as unknown as { counter: number }).counter
}

function notifySubscribers(): void {
  mockRedux.listeners.forEach((listener) => listener())
}

describe('atomFromReduxSelector', () => {
  beforeEach(() => {
    mockRedux.listeners.clear()
    mockRedux.state = { counter: 0 }
  })

  it('initializes from getState', () => {
    mockRedux.state = { counter: 5 }
    const store = createStore()
    const a = atomFromReduxSelector(selectCounter)
    expect(store.get(a)).toBe(5)
  })

  it('updates when Redux notifies and the selected value changes', () => {
    mockRedux.state = { counter: 0 }
    const store = createStore()
    const a = atomFromReduxSelector(selectCounter)

    const unsub = store.sub(a, () => {})

    expect(store.get(a)).toBe(0)

    mockRedux.state = { counter: 1 }
    notifySubscribers()

    expect(store.get(a)).toBe(1)

    unsub()
  })

  it('does not update when equalityFn reports no change', () => {
    mockRedux.state = { counter: 1 }
    const store = createStore()
    const a = atomFromReduxSelector(selectCounter, () => true)

    const unsub = store.sub(a, () => {})
    const snapshot = store.get(a)

    mockRedux.state = { counter: 99 }
    notifySubscribers()

    expect(store.get(a)).toBe(snapshot)

    unsub()
  })
})
