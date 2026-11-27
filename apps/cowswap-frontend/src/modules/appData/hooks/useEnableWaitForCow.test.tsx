import { createStore, Provider } from 'jotai'
import { ReactNode } from 'react'

import { renderHook } from '@testing-library/react'

import { canonicalBatchScheduleAtom, useIsWaitAndSaveAvailable, waitAndSaveEnabledAtom } from 'modules/trade'

import { useEnableWaitForCow } from './useEnableWaitForCow'

jest.mock('modules/trade', () => {
  const { atom } = jest.requireActual('jotai')

  return {
    canonicalBatchScheduleAtom: atom<
      { nextBatch: number; nextBatchValidTo: number; intervalSeconds: number } | undefined
    >(undefined),
    waitAndSaveEnabledAtom: atom(false),
    useIsWaitAndSaveAvailable: jest.fn(),
  }
})

const useIsWaitAndSaveAvailableMock = jest.mocked(useIsWaitAndSaveAvailable)

const schedule = {
  nextBatch: 1_700_000_180,
  nextBatchValidTo: 1_700_000_540,
  intervalSeconds: 300,
}

function renderEnableWaitForCow(options: {
  isAvailable: boolean
  isEnabled: boolean
  schedule: typeof schedule | undefined
}): boolean {
  useIsWaitAndSaveAvailableMock.mockReturnValue(options.isAvailable)

  const store = createStore()
  store.set(waitAndSaveEnabledAtom, options.isEnabled)
  store.set(canonicalBatchScheduleAtom, options.schedule)

  const wrapper = ({ children }: { children: ReactNode }): ReactNode => <Provider store={store}>{children}</Provider>
  const { result } = renderHook(() => useEnableWaitForCow(), { wrapper })

  return result.current
}

describe('useEnableWaitForCow', () => {
  beforeEach(() => {
    useIsWaitAndSaveAvailableMock.mockReset()
  })

  it('is false in the same render when the toggle is on but the schedule is missing', () => {
    expect(
      renderEnableWaitForCow({
        isAvailable: true,
        isEnabled: true,
        schedule: undefined,
      }),
    ).toBe(false)
  })

  it('is true only when the feature is available, opted in, and a schedule is loaded', () => {
    expect(
      renderEnableWaitForCow({
        isAvailable: true,
        isEnabled: true,
        schedule,
      }),
    ).toBe(true)
  })

  it('stays false when the schedule is loaded but the user has not opted in', () => {
    expect(
      renderEnableWaitForCow({
        isAvailable: true,
        isEnabled: false,
        schedule,
      }),
    ).toBe(false)
  })
})
