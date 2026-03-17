import { sendTransaction } from 'wagmi/actions'

import type { Hex } from 'viem'
import type { Config } from 'wagmi'

const DEDUPE_WINDOW_MS = 3000

type PresignTxParams = { to: `0x${string}`; value: bigint; data: Hex }

let inFlight: Promise<string> | null = null
let inFlightKey: string | null = null

function key(params: PresignTxParams): string {
  return `${params.to}:${params.value}:${params.data}`
}

/**
 * Wraps wagmi sendTransaction so a second call with the same (to, value, data)
 * while the first is in flight reuses the same promise. Avoids multiple
 * MetaMask windows for a single presign transaction.
 */
export async function deduplicatedSendTransaction(config: Config, params: PresignTxParams): Promise<string> {
  const txKey = key(params)
  if (inFlight !== null && inFlightKey === txKey) {
    return inFlight
  }
  inFlightKey = txKey
  inFlight = sendTransaction(config, params)
    .then((hash) => hash as string)
    .catch((err) => {
      if (inFlightKey === txKey) {
        inFlight = null
        inFlightKey = null
      }
      throw err
    })
    .finally(() => {
      const currentKey = inFlightKey
      setTimeout(() => {
        if (inFlightKey === currentKey) {
          inFlight = null
          inFlightKey = null
        }
      }, DEDUPE_WINDOW_MS)
    })
  return inFlight
}
