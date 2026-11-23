import { Provider, useAtomValue } from 'jotai'
import { createElement, ReactNode } from 'react'

import { QueryClient } from '@tanstack/react-query'

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
    fetchCanonicalBatchSchedule.mockReset()
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
  })

  afterEach(() => {
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

  it('advances a due batch by intervalSeconds until the refetch resolves', async () => {
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
})
