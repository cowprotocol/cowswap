import { Connection } from '@solana/web3.js'

/** `MAX_PROCESSING_AGE`: a blockhash stays usable for this many blocks after it was issued. */
const BLOCKHASH_VALID_BLOCKS = 150

// Used only when no performance samples are available; SIMD-0525 is moving real slot time towards 200ms.
const FALLBACK_SLOT_TIME_MS = 400

const PERFORMANCE_SAMPLES_COUNT = 4

// Keeps the optimistic estimate on the safe side of the real blockhash death.
const MAX_WINDOW_MS = 30_000

export interface SolanaSigningDeadline {
  /** Epoch ms after which the blockhash is expected to be dead. */
  expiresAt: number
  durationMs: number
}

/**
 * Wall-clock signing window for a transaction whose blockhash was fetched just before this call.
 * Deliberately no block-height read-back: a slow or inconsistent RPC reads a fresh blockhash as
 * already dead and paints an instant 00:00, so the window is anchored to the call time instead.
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
