import { Provider, useAtomValue } from 'jotai'
import { createElement, ReactNode } from 'react'

import { COW_BATCH_TIME_SECONDS } from '@cowprotocol/common-const'
import { localTimeOffsetAtom } from '@cowprotocol/common-hooks'
import { getCowBatchValidFrom } from '@cowprotocol/common-utils'
import { jotaiStore } from '@cowprotocol/core'

import { act, renderHook } from '@testing-library/react'

import { cowBatchValidFromAtom } from './cowBatchValidFromAtom'

const NOW_MS = 1_700_000_000_000

function Wrapper({ children }: { children: ReactNode }): ReactNode {
  return createElement(Provider, { store: jotaiStore }, children)
}

describe('cowBatchValidFromAtom', () => {
  beforeEach(() => {
    jest.useFakeTimers()
    jest.spyOn(Date, 'now').mockReturnValue(NOW_MS)
    jotaiStore.set(localTimeOffsetAtom, undefined)
    jotaiStore.set(cowBatchValidFromAtom, undefined)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('schedules next-batch validFrom on subscribe using offset 0 when skew is missing', () => {
    const { result, unmount } = renderHook(() => useAtomValue(cowBatchValidFromAtom), {
      wrapper: Wrapper,
    })

    const nowSec = NOW_MS / 1000
    expect(result.current).toBe(getCowBatchValidFrom(nowSec))

    unmount()
    expect(jotaiStore.get(cowBatchValidFromAtom)).toBeUndefined()
  })

  it('reschedules when local time offset changes', () => {
    const { result, unmount } = renderHook(() => useAtomValue(cowBatchValidFromAtom), {
      wrapper: Wrapper,
    })

    const offsetSec = 120
    act(() => {
      jotaiStore.set(localTimeOffsetAtom, offsetSec)
    })

    const nowSec = NOW_MS / 1000 - offsetSec
    expect(result.current).toBe(getCowBatchValidFrom(nowSec))

    unmount()
  })

  it('rolls to the next batch after the boundary timeout', () => {
    const { result, unmount } = renderHook(() => useAtomValue(cowBatchValidFromAtom), {
      wrapper: Wrapper,
    })

    const first = result.current
    expect(typeof first).toBe('number')
    if (typeof first !== 'number') {
      unmount()
      return
    }

    const delayMs = Math.max(1, (first - NOW_MS / 1000) * 1000)

    act(() => {
      jest.spyOn(Date, 'now').mockReturnValue(NOW_MS + delayMs)
      jest.advanceTimersByTime(delayMs)
    })

    const next = result.current
    expect(next).toBe(getCowBatchValidFrom((NOW_MS + delayMs) / 1000))
    expect(typeof next).toBe('number')
    if (typeof next === 'number') {
      expect(next).toBeGreaterThan(first)
      expect(next - first).toBe(COW_BATCH_TIME_SECONDS)
    }

    unmount()
  })
})
