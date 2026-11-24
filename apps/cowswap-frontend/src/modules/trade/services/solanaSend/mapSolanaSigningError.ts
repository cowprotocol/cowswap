import { normalizeError } from '@cowprotocol/common-utils'

/** EIP-1193 user rejection: the code `isRejectRequestProviderError` keys off. */
const USER_REJECTED_CODE = 4001

export function mapSolanaSigningError(err: unknown): Error {
  const error = normalizeError(err)

  return isSignatureMissingError(error) ? new SolanaWalletRejectionError(error) : error
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
  return error instanceof TypeError && /\bversion\b/.test(error.message) && /\bin\b/.test(error.message)
}
