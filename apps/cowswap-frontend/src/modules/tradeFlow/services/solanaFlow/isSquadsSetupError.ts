// Cap recursion in case a wallet produces a cyclic or pathologically deep cause chain.
const MAX_ERROR_CAUSE_DEPTH = 8

// SquadsX refuses the prompt with this sentence and no error code when the extension's key is not a
// proposer on the active Squad, so the wording is the only thing there is to match on. Matched as a
// fragment because the wallet words the subject around it differently between versions.
const SQUADS_INACTIVE_PROPOSER_MESSAGE = 'not an active proposer'

/**
 * Whether the wallet refused because the SquadsX extension has not been added to the Squad as an
 * active proposer — a setup step the user has to complete in Squads, not a failure of the order.
 *
 * Reads the raw message rather than `getProviderErrorMessage`, which rewords an EVM internal-RPC
 * error into copy of our own and would hide the sentence this matches on.
 */
export function isSquadsSetupError(error: unknown, depth = 0): boolean {
  if (!error || depth > MAX_ERROR_CAUSE_DEPTH) return false

  const message = getErrorMessage(error)

  if (message?.toLowerCase().includes(SQUADS_INACTIVE_PROPOSER_MESSAGE)) return true

  const cause = typeof error === 'object' && 'cause' in error ? error.cause : undefined

  return cause !== undefined && cause !== error ? isSquadsSetupError(cause, depth + 1) : false
}

function getErrorMessage(error: unknown): string | undefined {
  if (typeof error === 'string') return error
  if (typeof error !== 'object' || error === null) return undefined

  return 'message' in error && typeof error.message === 'string' ? error.message : undefined
}
