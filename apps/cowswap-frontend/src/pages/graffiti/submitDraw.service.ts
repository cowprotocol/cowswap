// The burn has already happened, so a transient failure must never be treated
// as terminal: 409 means the backend cannot see the transaction yet.

import { ApiError, postDraw, type DrawResponse } from './graffiti.service'
import { clearPendingBurn, savePendingBurn, type PendingBurn } from './pendingBurn.utils'

const MAX_ATTEMPTS = 8
const BASE_DELAY_MS = 1500
const MAX_DELAY_MS = 15_000

export type SubmitOutcome =
  | { ok: true; seq: number }
  /** Terminal: the backend will never accept this burn. */
  | { ok: false; reason: string; recoverable: false }
  /** Still retryable later — the record is kept so it can be resumed. */
  | { ok: false; reason: string; recoverable: true }

/** Retries while the backend reports a retryable failure. */
export async function submitDraw(
  burn: PendingBurn,
  onAttempt?: (attempt: number, max: number) => void,
): Promise<SubmitOutcome> {
  savePendingBurn(burn)

  let lastReason = 'draw rejected'

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    onAttempt?.(attempt, MAX_ATTEMPTS)

    try {
      const res: DrawResponse = await postDraw({
        txSignature: burn.txSignature,
        walletPubkey: burn.walletPubkey,
        cells: burn.cells,
      })

      clearPendingBurn()

      return { ok: true, seq: res.seq }
    } catch (err: unknown) {
      const retryable = err instanceof ApiError ? err.retryable : true

      lastReason = err instanceof Error ? err.message : String(err)

      if (!retryable) {
        // The backend has made a final decision; keeping the record would only
        // retry something that can never succeed.
        clearPendingBurn()

        return { ok: false, reason: lastReason, recoverable: false }
      }

      if (attempt < MAX_ATTEMPTS) {
        await delay(Math.min(BASE_DELAY_MS * 2 ** (attempt - 1), MAX_DELAY_MS))
      }
    }
  }

  return { ok: false, reason: lastReason, recoverable: true }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
