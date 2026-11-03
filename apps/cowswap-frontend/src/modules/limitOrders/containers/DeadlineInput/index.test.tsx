import { createStore, Provider } from 'jotai'

import { act, render } from '@testing-library/react'

import { limitOrdersSettingsAtom, updateLimitOrdersSettingsAtom } from '../../state/limitOrdersSettingsAtom'

import { DeadlineInput } from './index'

jest.mock('modules/injectedWidget', () => ({
  useInjectedWidgetDeadline: () => undefined,
}))

jest.mock('modules/limitOrders/pure/DeadlineSelector', () => ({
  DeadlineSelector: () => null,
}))

// 2024-04-16T10:54:01.000Z
const NOW_TIME = 1713264841000
const NOW_SECONDS = NOW_TIME / 1000

const ONE_HOUR = 60 * 60
const ONE_DAY = 24 * ONE_HOUR

function getCustomDeadline(store: ReturnType<typeof createStore>): number | null {
  return store.get(limitOrdersSettingsAtom).customDeadlineTimestamp
}

function renderDeadlineInput(customDeadlineTimestamp: number): ReturnType<typeof createStore> {
  const store = createStore()

  store.set(updateLimitOrdersSettingsAtom, { customDeadlineTimestamp })

  render(
    <Provider store={store}>
      <DeadlineInput />
    </Provider>,
  )

  return store
}

describe('DeadlineInput', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW_TIME)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('resets a persisted custom deadline that has already passed', () => {
    const store = renderDeadlineInput(NOW_SECONDS - ONE_HOUR)

    expect(getCustomDeadline(store)).toBe(null)
  })

  it('resets the custom deadline when it expires while the form is open', () => {
    const customDeadline = NOW_SECONDS + ONE_HOUR
    const store = renderDeadlineInput(customDeadline)

    act(() => {
      jest.advanceTimersByTime(ONE_HOUR * 1000 - 1)
    })
    expect(getCustomDeadline(store)).toBe(customDeadline)

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(getCustomDeadline(store)).toBe(null)
  })

  it('resets a custom deadline beyond the setTimeout() range once it expires', () => {
    const customDeadline = NOW_SECONDS + 30 * ONE_DAY
    const store = renderDeadlineInput(customDeadline)

    act(() => {
      jest.advanceTimersByTime(30 * ONE_DAY * 1000 - 1)
    })
    expect(getCustomDeadline(store)).toBe(customDeadline)

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(getCustomDeadline(store)).toBe(null)
  })
})
