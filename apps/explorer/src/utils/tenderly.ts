/** localStorage key for Tenderly dashboard username slug (e.g. `Danziger`). */
const TENDERLY_USER_STORAGE_KEY = 'TENDERLY_USER'

let TENDERLY_USER: string | undefined
let ENCODED_TENDERLY_USER: string | undefined

try {
  TENDERLY_USER = localStorage.getItem(TENDERLY_USER_STORAGE_KEY)?.trim()
  ENCODED_TENDERLY_USER = TENDERLY_USER ? encodeURIComponent(TENDERLY_USER) : undefined
} catch {}

/**
 * Tenderly dashboard URL for a transaction.
 * With a user slug (from {@link TENDERLY_USER_STORAGE_KEY}), uses the project-scoped path.
 */
export function getTenderlyTxUrl(txHash: string): string {
  const encodedTx = encodeURIComponent(txHash)

  return TENDERLY_USER
    ? `https://dashboard.tenderly.co/${ENCODED_TENDERLY_USER}/project/tx/${encodedTx}`
    : `https://dashboard.tenderly.co/tx/${encodedTx}`
}
