import { captureError, createCowLogger, ERROR_TYPES, isInsufficientFundsProviderError } from '@cowprotocol/common-utils'
import { OrderBookApiError, OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'

import { SolanaAppDataMismatchError } from './assertSignedAppData'
import { getSolanaErrorLogs } from './getSolanaErrorLogs'

export const SOLANA_ORDER_SENTRY_SCOPE = 'SolanaOrder'

const SENTRY_ERROR_NAME = 'SolanaOrderSubmissionError'
const EXPECTED_REASONS: ReadonlySet<SolanaOrderErrorReason> = new Set(['user-rejected', 'window-expired'])
const logger = createCowLogger(SOLANA_ORDER_SENTRY_SCOPE)

export interface ReportSolanaOrderErrorParams {
  error: Error
  chainId: SupportedChainId
  orderClass: OrderClass
  isSponsored: boolean
  /** False means the transaction never left the client, so no order can have been placed. */
  isSubmissionStarted: boolean
  isRejection: boolean
  isWindowExpiryFailure: boolean
  /** The message the user was shown, which is not always the message the wallet threw. */
  swapErrorMessage: string
}

/**
 * Why the attempt failed, as far as the client can tell:
 * - `user-rejected` — the wallet prompt was declined
 * - `window-expired` — the blockhash died before the signature came back
 * - `app-data-mismatch` — the signed hash does not cover the doc being registered
 * - `insufficient-funds` — not enough SOL for fees or rent
 * - `order-book` — the order book refused the signed bundle
 * - `program-error` — the transaction reached simulation and a program rejected it
 * - `unknown` — everything else, which in practice is the wallet's own wording
 */
export type SolanaOrderErrorReason =
  | 'user-rejected'
  | 'window-expired'
  | 'app-data-mismatch'
  | 'insufficient-funds'
  | 'order-book'
  | 'program-error'
  | 'unknown'

/**
 * Report a failed Solana order attempt under one Sentry scope, so the volume can be alerted on.
 *
 * Every wallet words the same failure differently and throws it from its own SDK, so Sentry's
 * default grouping scatters one outage across dozens of issues with one event each. The fingerprint
 * here pins the grouping to the classified reason instead, leaving a handful of stable issues; the
 * wallet's own wording stays searchable on the event and in the linked cause.
 *
 * A declined prompt and a countdown that ran out are both the flow working as designed, so neither
 * is reported — at trading volume they would swamp any threshold set on this scope.
 */
export function reportSolanaOrderError({
  error,
  chainId,
  orderClass,
  isSponsored,
  isSubmissionStarted,
  isRejection,
  isWindowExpiryFailure,
  swapErrorMessage,
}: ReportSolanaOrderErrorParams): void {
  const reason = classifySolanaOrderError({ error, isRejection, isWindowExpiryFailure })

  if (EXPECTED_REASONS.has(reason)) return

  const logs = getSolanaErrorLogs(error)
  const sentryError = new Error(`Solana order submission failed: ${reason}`, { cause: error })
  sentryError.name = SENTRY_ERROR_NAME

  logger.warn(`${SENTRY_ERROR_NAME} (reason: ${reason}, submitted: ${isSubmissionStarted})`, { chainId, error })

  captureError(
    sentryError,
    ERROR_TYPES.ON_SWAP,
    {
      chainId,
      orderClass,
      reason,
      isSponsored,
      isSubmissionStarted,
      swapErrorMessage,
      message: error.message,
      ...(logs ? { logs } : undefined),
      // Never reaches the order book on a mismatch, so this is the only record of what failed to hash.
      ...(error instanceof SolanaAppDataMismatchError && { fullAppData: error.fullAppData }),
    },
    {
      scope: SOLANA_ORDER_SENTRY_SCOPE,
      reason,
      orderClass,
      sponsored: String(isSponsored),
      submissionStarted: String(isSubmissionStarted),
    },
    [SOLANA_ORDER_SENTRY_SCOPE, reason],
  )
}

function classifySolanaOrderError({
  error,
  isRejection,
  isWindowExpiryFailure,
}: Pick<ReportSolanaOrderErrorParams, 'error' | 'isRejection' | 'isWindowExpiryFailure'>): SolanaOrderErrorReason {
  if (isRejection) return 'user-rejected'
  if (isWindowExpiryFailure) return 'window-expired'
  if (error instanceof SolanaAppDataMismatchError) return 'app-data-mismatch'
  if (isInsufficientFundsProviderError(error)) return 'insufficient-funds'
  if (error instanceof OrderBookApiError) return 'order-book'
  if (getSolanaErrorLogs(error)) return 'program-error'

  return 'unknown'
}
