import { Connection } from '@solana/web3.js'

/** `MAX_PROCESSING_AGE`: a blockhash stays usable for this many blocks after it was issued. */
const BLOCKHASH_VALID_BLOCKS = 150

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
 * Wall-clock signing window for a transaction whose blockhash was fetched just before this call.
 *
 * That freshness is why no block height is read back: a fresh blockhash is valid for exactly
 * `BLOCKHASH_VALID_BLOCKS` from now, and re-measuring the distance via a second RPC read can only
 * inject error — a rate-limited read resolving a minute late, or a node ahead of the one that issued
 * the blockhash, both read as an already-dead window and paint an instant 00:00. The window is
 * anchored to the call time instead, so a slow samples request shortens what is left to show but
 * never moves the deadline itself.
 */
export async function estimateSolanaSigningDeadline(connection: Connection): Promise<SolanaSigningDeadline> {
  const anchorMs = Date.now()
  const slotTimeMs = await measureSlotTime(connection)
  const durationMs = Math.min(Math.round(BLOCKHASH_VALID_BLOCKS * slotTimeMs), MAX_WINDOW_MS)

  return { expiresAt: anchorMs + durationMs, durationMs }
}

async function measureSlotTime(connection: Connection): Promise<number> {
  // Not every RPC provider serves performance samples; the fallback keeps the countdown available.
  try {
    const samples = await connection.getRecentPerformanceSamples(PERFORMANCE_SAMPLES_COUNT)

    const slotTimes = samples
      .filter((sample) => sample.numSlots > 0 && sample.samplePeriodSecs > 0)
      .map((sample) => (sample.samplePeriodSecs * 1000) / sample.numSlots)

    return slotTimes.length
      ? slotTimes.reduce((sum, value) => sum + value, 0) / slotTimes.length
      : FALLBACK_SLOT_TIME_MS
  } catch {
    return FALLBACK_SLOT_TIME_MS
  }
}
