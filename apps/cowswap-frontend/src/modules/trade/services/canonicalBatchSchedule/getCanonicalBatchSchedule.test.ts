import { backendEnv } from '@cowprotocol/common-utils'
import { ORDER_BOOK_PROD_CONFIG, ORDER_BOOK_STAGING_CONFIG, SupportedChainId } from '@cowprotocol/cow-sdk'

import {
  CanonicalBatchSchedule,
  fetchCanonicalBatchSchedule,
  getOptimisticCanonicalBatchSchedule,
  mapCanonicalBatchSchedule,
} from './getCanonicalBatchSchedule'

const schedule: CanonicalBatchSchedule = {
  nextBatch: 1_700_000_240,
  nextBatchValidTo: 1_700_000_600,
  intervalSeconds: 300,
}

const responseSchedule = {
  intervalSeconds: 300,
  nextBatch: 1_700_000_240,
  nextBatchValidTo: 1_700_000_900,
  secondsUntilNextBatch: 55,
}

describe('fetchCanonicalBatchSchedule', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('requests the env-resolved orderbook for that chain', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => responseSchedule,
    } as Response)

    const baseUrls = backendEnv === 'staging' ? ORDER_BOOK_STAGING_CONFIG : ORDER_BOOK_PROD_CONFIG

    await fetchCanonicalBatchSchedule(SupportedChainId.MAINNET)
    await fetchCanonicalBatchSchedule(SupportedChainId.GNOSIS_CHAIN)
    await fetchCanonicalBatchSchedule(SupportedChainId.LINEA)

    expect(jest.mocked(globalThis.fetch).mock.calls.map((call) => String(call[0]))).toEqual([
      `${baseUrls[SupportedChainId.MAINNET]}/api/v1/canonical_batch_schedule`,
      `${baseUrls[SupportedChainId.GNOSIS_CHAIN]}/api/v1/canonical_batch_schedule`,
      `${baseUrls[SupportedChainId.LINEA]}/api/v1/canonical_batch_schedule`,
    ])
  })

  it('throws when the orderbook responds with an error status', async () => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({}),
    } as Response)

    await expect(fetchCanonicalBatchSchedule(SupportedChainId.MAINNET)).rejects.toThrow(
      'canonical_batch_schedule failed with 404',
    )
  })
})

describe('mapCanonicalBatchSchedule', () => {
  it('uses nextBatch as the countdown target even when secondsUntilNextBatch differs', () => {
    expect(
      mapCanonicalBatchSchedule({
        intervalSeconds: 300,
        nextBatch: 1_700_000_240,
        secondsUntilNextBatch: 55,
        nextBatchValidTo: 1_700_000_900,
      }),
    ).toEqual({
      nextBatch: 1_700_000_240,
      nextBatchValidTo: 1_700_000_900,
      intervalSeconds: 300,
    })
  })

  it('takes nextBatchValidTo from the response', () => {
    const nextBatch = 1_700_000_240
    const intervalSeconds = 300
    const nextBatchValidTo = 1_700_000_900

    expect(
      mapCanonicalBatchSchedule({
        intervalSeconds,
        nextBatch,
        secondsUntilNextBatch: 55,
        nextBatchValidTo,
      }).nextBatchValidTo,
    ).toBe(nextBatchValidTo)
  })

  it('throws when the body is invalid', () => {
    const invalidBodies: unknown[] = [
      {},
      { nextBatch: 1_700_000_240, secondsUntilNextBatch: 55, intervalSeconds: 300 },
      { nextBatchValidTo: 1_700_000_900, secondsUntilNextBatch: 55, intervalSeconds: 300 },
      { nextBatch: 1_700_000_240, nextBatchValidTo: 1_700_000_900 },
      { nextBatch: 1_700_000_240, nextBatchValidTo: 1_700_000_900, intervalSeconds: 0 },
      { nextBatch: 1_700_000_240, nextBatchValidTo: 1_700_000_900, intervalSeconds: -300 },
    ]

    for (const body of invalidBodies) {
      expect(() => mapCanonicalBatchSchedule(body)).toThrow('canonical_batch_schedule response is invalid')
    }
  })
})

describe('getOptimisticCanonicalBatchSchedule', () => {
  it('keeps the schedule while the batch is still ahead', () => {
    expect(getOptimisticCanonicalBatchSchedule(schedule, 1_700_000_239_000)).toEqual(schedule)
  })

  it('steps one interval forward when the batch is due', () => {
    expect(getOptimisticCanonicalBatchSchedule(schedule, schedule.nextBatch * 1_000)).toEqual({
      nextBatch: schedule.nextBatch + schedule.intervalSeconds,
      nextBatchValidTo: schedule.nextBatchValidTo + schedule.intervalSeconds,
      intervalSeconds: schedule.intervalSeconds,
    })
  })

  it('steps across the intervals that passed before the refetch resolves', () => {
    const nowMs = (schedule.nextBatch + schedule.intervalSeconds + 10) * 1_000

    expect(getOptimisticCanonicalBatchSchedule(schedule, nowMs)).toEqual({
      nextBatch: schedule.nextBatch + schedule.intervalSeconds * 2,
      nextBatchValidTo: schedule.nextBatchValidTo + schedule.intervalSeconds * 2,
      intervalSeconds: schedule.intervalSeconds,
    })
  })
})
