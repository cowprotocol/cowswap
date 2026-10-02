import { Connection } from '@solana/web3.js'

import { estimateSolanaSigningDeadline } from './estimateSolanaSigningDeadline'

function createConnection(params: {
  samples?: { numSlots: number; samplePeriodSecs: number }[]
  failing?: boolean
}): Connection {
  const { samples = [], failing = false } = params

  return {
    getRecentPerformanceSamples: failing
      ? jest.fn().mockRejectedValue(new Error('rpc down'))
      : jest.fn().mockResolvedValue(samples),
  } as unknown as Connection
}

describe('estimateSolanaSigningDeadline', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(1_000_000)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('derives the window from the 150-block validity and the measured slot time', async () => {
    // 100ms slots: 150 blocks last 15s, under the cap.
    const connection = createConnection({
      samples: [
        { numSlots: 600, samplePeriodSecs: 60 },
        { numSlots: 600, samplePeriodSecs: 60 },
      ],
    })

    const deadline = await estimateSolanaSigningDeadline(connection)

    expect(deadline).toEqual({ durationMs: 15_000, expiresAt: 1_015_000 })
  })

  it('caps the window at 30s even when the chain reports a longer one', async () => {
    // 400ms slots: 150 blocks last 60s, twice the cap.
    const connection = createConnection({ samples: [{ numSlots: 150, samplePeriodSecs: 60 }] })

    const deadline = await estimateSolanaSigningDeadline(connection)

    expect(deadline).toEqual({ durationMs: 30_000, expiresAt: 1_030_000 })
  })

  it('falls back to 400ms per slot when no usable samples are reported', async () => {
    const connection = createConnection({ samples: [{ numSlots: 0, samplePeriodSecs: 60 }] })

    const deadline = await estimateSolanaSigningDeadline(connection)

    expect(deadline).toEqual({ durationMs: 30_000, expiresAt: 1_030_000 })
  })

  it('still reports a window when the samples call fails, instead of dropping the countdown', async () => {
    const deadline = await estimateSolanaSigningDeadline(createConnection({ failing: true }))

    expect(deadline).toEqual({ durationMs: 30_000, expiresAt: 1_030_000 })
  })
})
