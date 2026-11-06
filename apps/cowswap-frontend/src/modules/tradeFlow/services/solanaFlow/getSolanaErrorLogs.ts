// The failing instruction logs last, so the tail is the part worth showing.
const MAX_LOG_LINES = 10
const MAX_ERROR_CAUSE_DEPTH = 3

/**
 * Program logs carried by a Solana failure, when it has any: `SendTransactionError` exposes them
 * on `logs`, and wallets tend to re-throw it wrapped in a `cause` chain. A wallet-level failure
 * (a rejected or mishandled prompt) never reaches simulation, so it has none.
 */
export function getSolanaErrorLogs(error: unknown, depth = 0): string[] | null {
  if (!error || typeof error !== 'object' || depth > MAX_ERROR_CAUSE_DEPTH) return null

  const { logs } = error as { logs?: unknown }

  if (Array.isArray(logs)) {
    const lines = logs.filter((line): line is string => typeof line === 'string')

    if (lines.length > 0) return lines.slice(-MAX_LOG_LINES)
  }

  return 'cause' in error ? getSolanaErrorLogs(error.cause, depth + 1) : null
}
