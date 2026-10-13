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

  it('derives the window from the 150-block validity, less the submission buffer', async () => {
    // 100ms slots: the blockhash lives 15s, so 5s of it is the user's to spend.
    const connection = createConnection({
      samples: [
        { numSlots: 600, samplePeriodSecs: 60 },
        { numSlots: 600, samplePeriodSecs: 60 },
      ],
    })

    const deadline = await estimateSolanaSigningDeadline(connection)

    expect(deadline).toEqual({ durationMs: 5_000, expiresAt: 1_005_000 })
  })

  // Post-SIMD-0525 mainnet: 150 blocks last 30s, and the user gets 20s of that.
  it('leaves 20s to sign at the current 200ms slot time', async () => {
    const connection = createConnection({ samples: [{ numSlots: 300, samplePeriodSecs: 60 }] })

    const deadline = await estimateSolanaSigningDeadline(connection)

    expect(deadline).toEqual({ durationMs: 20_000, expiresAt: 1_020_000 })
  })

  it('caps the window at 20s even when the chain reports a longer one', async () => {
    // 400ms slots: 150 blocks last 60s, well past the cap even after the buffer.
    const connection = createConnection({ samples: [{ numSlots: 150, samplePeriodSecs: 60 }] })

    const deadline = await estimateSolanaSigningDeadline(connection)

    expect(deadline).toEqual({ durationMs: 20_000, expiresAt: 1_020_000 })
  })

  // A blockhash that cannot outlive the buffer leaves nothing to sign in; the countdown is dropped
  // rather than opened on a window the submission would eat whole.
  it('reports no window when the blockhash cannot outlive the submission buffer', async () => {
    const connection = createConnection({ samples: [{ numSlots: 1200, samplePeriodSecs: 60 }] })

    const deadline = await estimateSolanaSigningDeadline(connection)

    expect(deadline).toEqual({ durationMs: 0, expiresAt: 1_000_000 })
  })

  it('falls back to 200ms per slot when no usable samples are reported', async () => {
    const connection = createConnection({ samples: [{ numSlots: 0, samplePeriodSecs: 60 }] })

    const deadline = await estimateSolanaSigningDeadline(connection)

    expect(deadline).toEqual({ durationMs: 20_000, expiresAt: 1_020_000 })
  })

  it('still reports a window when the samples call fails, instead of dropping the countdown', async () => {
    const deadline = await estimateSolanaSigningDeadline(createConnection({ failing: true }))

    expect(deadline).toEqual({ durationMs: 20_000, expiresAt: 1_020_000 })
  })
})
