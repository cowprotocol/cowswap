import { Provider, useAtomValue } from 'jotai'
import { createElement, ReactNode } from 'react'

import { QueryClient } from '@tanstack/react-query'

import { jotaiStore } from '@cowprotocol/core'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { walletInfoAtom } from '@cowprotocol/wallet'

import { act, renderHook, waitFor } from '@testing-library/react'
import { queryClientAtom } from 'jotai-tanstack-query'

import {
  canonicalBatchCountdownTargetAtom,
  canonicalBatchNextBatchAtom,
  canonicalBatchScheduleQueryAtom,
  isCanonicalBatchScheduleErrorAtom,
} from './canonicalBatchScheduleAtom'

import * as scheduleService from '../services/canonicalBatchSchedule/getCanonicalBatchSchedule'

const actualScheduleService = jest.requireActual(
  '../services/canonicalBatchSchedule/getCanonicalBatchSchedule',
) as typeof scheduleService

jest.mock('../services/canonicalBatchSchedule/getCanonicalBatchSchedule', () => {
  const actual = jest.requireActual('../services/canonicalBatchSchedule/getCanonicalBatchSchedule')

  return {
    ...actual,
    getMockCanonicalBatchSchedule: jest.fn(actual.getMockCanonicalBatchSchedule),
    fetchCanonicalBatchSchedule: jest.fn(),
  }
})

const getMockCanonicalBatchSchedule = jest.mocked(scheduleService.getMockCanonicalBatchSchedule)

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
    getMockCanonicalBatchSchedule.mockReset()
    getMockCanonicalBatchSchedule.mockImplementation(actualScheduleService.getMockCanonicalBatchSchedule)
  })

  it('exposes nextBatch and countdown target from the mock schedule', async () => {
    const nowMs = 1_700_000_000_000
    jest.spyOn(Date, 'now').mockReturnValue(nowMs)
    getMockCanonicalBatchSchedule.mockReturnValue({
      nextBatch: 1_700_000_180,
      countdownTargetEpochSec: 1_700_000_180,
      secondsUntilNextBatch: 180,
      nextBatchValidTo: 1_700_000_420,
      nextBatchExpiration: 1_700_000_355,
    })

    const { result, unmount } = renderHook(
      () => ({
        query: useAtomValue(canonicalBatchScheduleQueryAtom),
        nextBatch: useAtomValue(canonicalBatchNextBatchAtom),
        countdownTarget: useAtomValue(canonicalBatchCountdownTargetAtom),
        isError: useAtomValue(isCanonicalBatchScheduleErrorAtom),
      }),
      { wrapper: Wrapper },
    )

    await waitFor(() => {
      expect(result.current.nextBatch).toBe(1_700_000_180)
    })

    expect(result.current.countdownTarget).toBe(1_700_000_180)
    expect(result.current.isError).toBe(false)

    unmount()
    jest.restoreAllMocks()
  })

  it('marks an error when the schedule query fails after retries', async () => {
    getMockCanonicalBatchSchedule.mockImplementation(() => {
      throw new Error('schedule unavailable')
    })

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

    expect(getMockCanonicalBatchSchedule).not.toHaveBeenCalled()
    expect(result.current.data).toBeUndefined()

    unmount()
  })
})
