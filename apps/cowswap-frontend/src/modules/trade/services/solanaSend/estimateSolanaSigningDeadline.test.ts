import { Connection } from '@solana/web3.js'

import { estimateSolanaSigningDeadline } from './estimateSolanaSigningDeadline'

function createConnection(params: {
  blockHeight?: number
  samples?: { numSlots: number; samplePeriodSecs: number }[]
  failing?: boolean
}): Connection {
  const { blockHeight = 1_000, samples = [], failing = false } = params

  return {
    getBlockHeight: failing
      ? jest.fn().mockRejectedValue(new Error('rpc down'))
      : jest.fn().mockResolvedValue(blockHeight),
    getRecentPerformanceSamples: jest.fn().mockResolvedValue(samples),
  } as unknown as Connection
}

describe('estimateSolanaSigningDeadline', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(1_000_000)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('derives the window from the remaining blocks and the measured slot time', async () => {
    const connection = createConnection({
      blockHeight: 1_000,
      samples: [
        { numSlots: 100, samplePeriodSecs: 26 },
        { numSlots: 100, samplePeriodSecs: 26 },
      ],
    })

    const deadline = await estimateSolanaSigningDeadline(connection, 1_100)

    expect(deadline).toEqual({ durationMs: 26_000, expiresAt: 1_026_000 })
  })

  it('falls back to 400ms per slot when no usable samples are reported', async () => {
    const connection = createConnection({ blockHeight: 1_000, samples: [{ numSlots: 0, samplePeriodSecs: 60 }] })

    const deadline = await estimateSolanaSigningDeadline(connection, 1_100)

    expect(deadline).toEqual({ durationMs: 40_000, expiresAt: 1_040_000 })
  })

  it('reports a zero window when the height already passed', async () => {
    const connection = createConnection({ blockHeight: 1_200, samples: [] })

    const deadline = await estimateSolanaSigningDeadline(connection, 1_100)

    expect(deadline).toEqual({ durationMs: 0, expiresAt: 1_000_000 })
  })

  it('returns null instead of a made-up number when the RPC fails', async () => {
    const deadline = await estimateSolanaSigningDeadline(createConnection({ failing: true }), 1_100)

    expect(deadline).toBeNull()
  })
})
