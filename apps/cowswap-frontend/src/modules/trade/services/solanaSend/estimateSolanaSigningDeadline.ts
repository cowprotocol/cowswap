import { Connection } from '@solana/web3.js'

/** `MAX_PROCESSING_AGE`: a blockhash stays usable for this many blocks after it was issued. */
const BLOCKHASH_VALID_BLOCKS = 150

// Used only when no performance samples are available. SIMD-0525 has landed, so mainnet slots are
// 200ms rather than the 400ms this used to assume.
const FALLBACK_SLOT_TIME_MS = 200

const PERFORMANCE_SAMPLES_COUNT = 4

/**
 * Held back from the blockhash's own lifetime for everything that still has to happen after the
 * signature: the hand-over to the order book and its own submission. Measured against staging after
 * the slot-time cut — a signature with 9s left on the countdown still executed, 8s and below always
 * came back expired.
 */
const SUBMISSION_BUFFER_MS = 10_000

// Keeps the optimistic estimate on the safe side of the real blockhash death.
const MAX_WINDOW_MS = 20_000

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
  const blockhashLifetimeMs = Math.round(BLOCKHASH_VALID_BLOCKS * slotTimeMs)
  const durationMs = Math.max(0, Math.min(blockhashLifetimeMs - SUBMISSION_BUFFER_MS, MAX_WINDOW_MS))

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
