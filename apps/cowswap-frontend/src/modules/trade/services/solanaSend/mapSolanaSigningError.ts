import { normalizeError } from '@cowprotocol/common-utils'

/** EIP-1193 user rejection: the code `isRejectRequestProviderError` keys off. */
const USER_REJECTED_CODE = 4001

/**
 * Whether the wallet ended the prompt without telling us why. Treated as a rejection for the user —
 * no signature, nothing submitted — but kept distinguishable so it still reaches Sentry: the same
 * swallow hides a wallet that is simply broken on a given transaction.
 */
export function isSwallowedWalletRejection(error: unknown): boolean {
  return error instanceof SolanaWalletRejectionError
}

/**
 * Anything but the Trust Wallet shape is handed back exactly as it came: a provider that rejects
 * with a plain object keeps its `cause` chain, which `normalizeError` would drop along with the
 * 4001 hiding in it.
 */
export function mapSolanaSigningError(err: unknown): unknown {
  const error = normalizeError(err)

  return isSignatureMissingError(error) ? new SolanaWalletRejectionError(error) : err
}

class SolanaWalletRejectionError extends Error {
  readonly code = USER_REJECTED_CODE

  constructor(cause: Error) {
    super('User rejected the request.', { cause })
  }
}

/**
 * Trust Wallet's in-app browser never reports a dismissed prompt as a rejection: its provider logs
 * the failure and resolves `undefined`, and its wallet-standard shim then evaluates
 * `'version' in undefined` (`MobileAdapter.legacySign` → `adapter/wallet.ts` in
 * trust-web3-provider). All that reaches us is a TypeError naming `version`, which would otherwise
 * be shown as a failed transaction. No signature came back either way, so nothing was submitted.
 */
function isSignatureMissingError(error: Error): boolean {
  return error instanceof TypeError && /version["']?\s*in\b/.test(error.message)
}
