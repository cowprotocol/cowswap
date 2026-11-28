import { Provider, useAtomValue } from 'jotai'
import { createElement, ReactNode } from 'react'

import { QueryClient } from '@tanstack/react-query'

import { localTimeOffsetAtom } from '@cowprotocol/common-hooks'
import { jotaiStore } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { act, renderHook, waitFor } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import {
  canonicalBatchNextBatchAtom,
  canonicalBatchScheduleAtom,
  canonicalBatchScheduleQueryAtom,
  isCanonicalBatchScheduleErrorAtom,
} from './canonicalBatchScheduleAtom'

import * as scheduleService from '../services/canonicalBatchSchedule/getCanonicalBatchSchedule'

jest.mock('../services/canonicalBatchSchedule/getCanonicalBatchSchedule', () => {
  const actual = jest.requireActual('../services/canonicalBatchSchedule/getCanonicalBatchSchedule')

  return {
    ...actual,
    fetchCanonicalBatchSchedule: jest.fn(),
  }
})

const fetchCanonicalBatchSchedule = jest.mocked(scheduleService.fetchCanonicalBatchSchedule)

const LOCAL_NOW_MS = 1_700_000_000_000

async function flushFakeTimers(): Promise<void> {
  await act(async () => {
    await jest.advanceTimersByTimeAsync(0)
  })
}

function installAdjustedClock(nowMs: number): void {
  jest.restoreAllMocks()
  jest.useFakeTimers()
  jest.setSystemTime(nowMs)
}

function Wrapper({ children }: { children: ReactNode }): ReactNode {
  return createElement(Provider, { store: jotaiStore }, children)
}

describe('canonicalBatchScheduleAtom', () => {
  beforeEach(() => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
    jotaiStore.set(queryClientAtom, queryClient)
    jotaiStore.set(walletInfoAtom, { chainId: SupportedChainId.MAINNET })
    jotaiStore.set(localTimeOffsetAtom, 0)
    fetchCanonicalBatchSchedule.mockReset()
    jest.spyOn(Date, 'now').mockReturnValue(LOCAL_NOW_MS)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('exposes nextBatch as the countdown target', async () => {
    fetchCanonicalBatchSchedule.mockResolvedValue({
      nextBatch: 1_700_000_180,
      nextBatchValidTo: 1_700_000_540,
      intervalSeconds: 300,
    })

    const { result, unmount } = renderHook(
      () => ({
        query: useAtomValue(canonicalBatchScheduleQueryAtom),
        nextBatch: useAtomValue(canonicalBatchNextBatchAtom),
        isError: useAtomValue(isCanonicalBatchScheduleErrorAtom),
      }),
      { wrapper: Wrapper },
    )

    await waitFor(() => {
      expect(result.current.nextBatch).toBe(1_700_000_180)
    })

    expect(result.current.isError).toBe(false)

    unmount()
  })

  it('advances a due batch by one interval when the offset is 0', async () => {
    const nextBatch = 1_700_000_180
    const nextBatchValidTo = 1_700_000_540
    const intervalSeconds = 300
    jest.spyOn(Date, 'now').mockReturnValue(nextBatch * 1_000)
    fetchCanonicalBatchSchedule.mockResolvedValue({
      nextBatch,
      nextBatchValidTo,
      intervalSeconds,
    })

    const { result, unmount } = renderHook(
      () => ({
        nextBatch: useAtomValue(canonicalBatchNextBatchAtom),
        schedule: useAtomValue(canonicalBatchScheduleAtom),
      }),
      { wrapper: Wrapper },
    )

    await waitFor(() => {
      expect(result.current.nextBatch).toBe(nextBatch + intervalSeconds)
    })

    expect(result.current.schedule).toEqual({
      nextBatch: nextBatch + intervalSeconds,
      nextBatchValidTo: nextBatchValidTo + intervalSeconds,
      intervalSeconds,
    })

    unmount()
  })

  it('marks an error when the schedule query fails after retries', async () => {
    fetchCanonicalBatchSchedule.mockRejectedValue(new Error('schedule unavailable'))

    const { result, unmount } = renderHook(
      () => ({
        nextBatch: useAtomValue(canonicalBatchNextBatchAtom),
        isError: useAtomValue(isCanonicalBatchScheduleErrorAtom),
      }),
      { wrapper: Wrapper },
    )

    await waitFor(() => {
      expect(result.current.isError).toBe(true)
    })

    expect(result.current.nextBatch).toBeUndefined()

    unmount()
  })

  it('does not fetch when the chain is unsupported', async () => {
    await act(async () => {
      jotaiStore.set(walletInfoAtom, { chainId: SupportedChainId.SOLANA })
    })

    const { result, unmount } = renderHook(() => useAtomValue(canonicalBatchScheduleQueryAtom), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current.fetchStatus).toBe('idle')
    })

    expect(fetchCanonicalBatchSchedule).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()

    unmount()
  })

  it('does not skip two intervals when the local clock is 600s ahead of a batch 180s out', async () => {
    const offsetSec = 600
    const intervalSeconds = 300
    const serverNowSec = LOCAL_NOW_MS / 1_000 - offsetSec
    const nextBatch = serverNowSec + 180
    const nextBatchValidTo = nextBatch + 360

    jotaiStore.set(localTimeOffsetAtom, offsetSec)
    fetchCanonicalBatchSchedule.mockResolvedValue({
      nextBatch,
      nextBatchValidTo,
      intervalSeconds,
    })

    const { result, unmount } = renderHook(() => useAtomValue(canonicalBatchScheduleAtom), {
      wrapper: Wrapper,
    })

    await waitFor(() => {
      expect(result.current?.nextBatch).toBe(nextBatch)
    })

    expect(result.current).toEqual({
      nextBatch,
      nextBatchValidTo,
      intervalSeconds,
    })

    unmount()
  })

  it('refetches a batch 180s out on the server boundary when the local clock is 600s behind', async () => {
    installAdjustedClock(LOCAL_NOW_MS)

    const offsetSec = -600
    const intervalSeconds = 300
    const serverNowSec = LOCAL_NOW_MS / 1_000 - offsetSec
    const nextBatch = serverNowSec + 180

    jotaiStore.set(localTimeOffsetAtom, offsetSec)
    fetchCanonicalBatchSchedule.mockResolvedValue({
      nextBatch,
      nextBatchValidTo: nextBatch + 360,
      intervalSeconds,
    })

    const { unmount } = renderHook(() => useAtomValue(canonicalBatchScheduleQueryAtom), {
      wrapper: Wrapper,
    })

    await flushFakeTimers()

    expect(fetchCanonicalBatchSchedule).toHaveBeenCalledTimes(1)

    await act(async () => {
      await jest.advanceTimersByTimeAsync(179_000)
    })

    expect(fetchCanonicalBatchSchedule).toHaveBeenCalledTimes(1)

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1_000)
    })

    expect(fetchCanonicalBatchSchedule).toHaveBeenCalledTimes(2)

    unmount()
  })

  it('advances nextBatch at the boundary while a refetch started earlier is still pending', async () => {
    installAdjustedClock(LOCAL_NOW_MS)

    const intervalSeconds = 300
    const nextBatch = LOCAL_NOW_MS / 1_000 + 180
    const schedule = {
      nextBatch,
      nextBatchValidTo: nextBatch + 360,
      intervalSeconds,
    }

    fetchCanonicalBatchSchedule.mockImplementation(() => {
      if (fetchCanonicalBatchSchedule.mock.calls.length === 1) {
        return Promise.resolve(schedule)
      }

      return new Promise(() => undefined)
    })

    const { result, unmount } = renderHook(() => useAtomValue(canonicalBatchNextBatchAtom), {
      wrapper: Wrapper,
    })

    await flushFakeTimers()

    expect(result.current).toBe(nextBatch)

    await act(async () => {
      void jotaiStore.get(canonicalBatchScheduleQueryAtom).refetch()
      await jest.advanceTimersByTimeAsync(0)
    })

    expect(fetchCanonicalBatchSchedule).toHaveBeenCalledTimes(2)
    expect(result.current).toBe(nextBatch)

    await act(async () => {
      await jest.advanceTimersByTimeAsync(180_000)
    })

    expect(result.current).toBe(nextBatch + intervalSeconds)
    expect(fetchCanonicalBatchSchedule).toHaveBeenCalledTimes(2)

    unmount()
  })

  it('keeps the schedule when a refetch fails and polls again after 30s', async () => {
    installAdjustedClock(LOCAL_NOW_MS)

    const intervalSeconds = 300
    const nextBatch = LOCAL_NOW_MS / 1_000 + 180
    const schedule = {
      nextBatch,
      nextBatchValidTo: nextBatch + 360,
      intervalSeconds,
    }

    fetchCanonicalBatchSchedule.mockImplementation(() => {
      if (fetchCanonicalBatchSchedule.mock.calls.length === 1) {
        return Promise.resolve(schedule)
      }

      return Promise.reject(new Error('schedule unavailable'))
    })

    const { result, unmount } = renderHook(
      () => ({
        nextBatch: useAtomValue(canonicalBatchNextBatchAtom),
        isError: useAtomValue(isCanonicalBatchScheduleErrorAtom),
      }),
      { wrapper: Wrapper },
    )

    await flushFakeTimers()

    expect(result.current.nextBatch).toBe(nextBatch)
    expect(result.current.isError).toBe(false)
    expect(fetchCanonicalBatchSchedule).toHaveBeenCalledTimes(1)
    expect(fetchCanonicalBatchSchedule).toHaveBeenCalledWith(SupportedChainId.MAINNET, expect.any(AbortSignal))

    await act(async () => {
      await jest.advanceTimersByTimeAsync(180_000)
    })

    expect(fetchCanonicalBatchSchedule).toHaveBeenCalledTimes(2)
    expect(result.current.isError).toBe(false)
    expect(result.current.nextBatch).toBe(nextBatch + intervalSeconds)

    await act(async () => {
      await jest.advanceTimersByTimeAsync(29_000)
    })

    expect(fetchCanonicalBatchSchedule).toHaveBeenCalledTimes(2)
    expect(result.current.isError).toBe(false)

    await act(async () => {
      await jest.advanceTimersByTimeAsync(1_000)
    })

    expect(fetchCanonicalBatchSchedule).toHaveBeenCalledTimes(3)
    expect(result.current.isError).toBe(false)

    unmount()
  })
})
