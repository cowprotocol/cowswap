// Crash-safe record of a burn that has landed on-chain but has not yet been
// accepted by the backend.
//
// The paint flow burns tokens first and only then tells the server. Everything
// between those two points — a reload, a dropped connection, the backend's RPC
// not seeing the transaction yet — would otherwise destroy the user's tokens
// with nothing painted. The burn is irreversible, so the signature is written
// to localStorage the moment it exists and only cleared once the draw is
// applied.

import type { Cell } from './raster.utils'

const STORAGE_KEY = 'graffiti:pendingBurn:v1'

/** Give up on a stored burn once the backend could never accept it anyway. */
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export interface PendingBurn {
  txSignature: string
  walletPubkey: string
  cells: Array<Cell>
  createdAt: number
}

export function clearPendingBurn(): void {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    /* nothing to do */
  }
}

export function loadPendingBurn(): PendingBurn | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) return null

    const parsed = JSON.parse(raw) as Partial<PendingBurn>

    if (
      typeof parsed.txSignature !== 'string' ||
      typeof parsed.walletPubkey !== 'string' ||
      !Array.isArray(parsed.cells) ||
      typeof parsed.createdAt !== 'number'
    ) {
      clearPendingBurn()

      return null
    }

    if (Date.now() - parsed.createdAt > MAX_AGE_MS) {
      clearPendingBurn()

      return null
    }

    return parsed as PendingBurn
  } catch {
    return null
  }
}

export function savePendingBurn(burn: PendingBurn): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(burn))
  } catch {
    // Private mode or quota: the in-memory retry path still applies.
  }
}
