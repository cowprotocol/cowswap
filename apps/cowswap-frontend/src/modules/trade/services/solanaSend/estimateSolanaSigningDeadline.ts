import { Connection } from '@solana/web3.js'

/**
 * SIMD-0525 is migrating slot time from 400ms towards 200ms while `MAX_PROCESSING_AGE` stays at
 * 150 slots, so the wall-clock signing window keeps shrinking (~40s at ~260ms/slot as of Sep 2026).
 * The recent-performance samples reflect whatever the cluster currently runs at; this constant only
 * covers the case where none are available.
 */
const FALLBACK_SLOT_TIME_MS = 400

const PERFORMANCE_SAMPLES_COUNT = 4

/**
 * The estimate is optimistic — it assumes the current slot rate holds and ignores the time the
 * signed bundle still needs to reach the order book. Capping the window keeps the countdown on the
 * safe side of the real blockhash death.
 */
const MAX_WINDOW_MS = 30_000

export interface SolanaSigningDeadline {
  /** Epoch ms after which the blockhash is expected to be dead. */
  expiresAt: number
  durationMs: number
}

/**
 * Converts a transaction's `lastValidBlockHeight` into an approximate wall-clock deadline by
 * measuring how far the chain is from it and how fast slots are currently produced.
 *
 * Best-effort: returns null when the RPC calls fail, so callers can skip the countdown rather
 * than show a made-up number.
 */
export async function estimateSolanaSigningDeadline(
  connection: Connection,
  lastValidBlockHeight: number,
): Promise<SolanaSigningDeadline | null> {
  try {
    const [currentBlockHeight, samples] = await Promise.all([
      connection.getBlockHeight(),
      connection.getRecentPerformanceSamples(PERFORMANCE_SAMPLES_COUNT),
    ])

    const slotTimes = samples
      .filter((sample) => sample.numSlots > 0 && sample.samplePeriodSecs > 0)
      .map((sample) => (sample.samplePeriodSecs * 1000) / sample.numSlots)

    const slotTimeMs = slotTimes.length
      ? slotTimes.reduce((sum, value) => sum + value, 0) / slotTimes.length
      : FALLBACK_SLOT_TIME_MS

    const remainingBlocks = Math.max(0, lastValidBlockHeight - currentBlockHeight)
    const durationMs = Math.min(Math.round(remainingBlocks * slotTimeMs), MAX_WINDOW_MS)

    return { expiresAt: Date.now() + durationMs, durationMs }
  } catch {
    return null
  }
}
