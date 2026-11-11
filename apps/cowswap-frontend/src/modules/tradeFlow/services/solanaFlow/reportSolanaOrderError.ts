import { captureError, createCowLogger, ERROR_TYPES, isInsufficientFundsProviderError } from '@cowprotocol/common-utils'
import { OrderBookApiError, OrderClass, SupportedChainId } from '@cowprotocol/cow-sdk'

import { SolanaAppDataMismatchError } from './assertSignedAppData'
import { getSolanaErrorLogs } from './getSolanaErrorLogs'
import { isSquadsSetupError } from './isSquadsSetupError'

export const SOLANA_ORDER_SENTRY_SCOPE = 'SolanaOrder'

const SENTRY_ERROR_NAME = 'SolanaOrderSubmissionError'
const MAX_CAUSE_DEPTH = 4
const MAX_ERROR_KEYS = 12
const EXPECTED_REASONS: ReadonlySet<SolanaOrderErrorReason> = new Set(['user-rejected', 'window-expired'])
const SUBMITTED_PHASES: ReadonlySet<SolanaOrderPhase> = new Set(['submit', 'register'])
const logger = createCowLogger(SOLANA_ORDER_SENTRY_SCOPE)

export interface ReportSolanaOrderErrorParams {
  error: Error
  chainId: SupportedChainId
  orderClass: OrderClass
  phase: SolanaOrderPhase
  /** Which Solana order attempt this is since the page loaded, counting from 1. */
  attempt: number
  /**
   * Whether an attempt has already failed unexpectedly since the page loaded, with no success since.
   * The failure has been reported as sticking until a reload, so this is what separates a client that
   * has stopped being able to trade from a one-off.
   */
  followsFailure: boolean
  isSponsored: boolean
  isRejection: boolean
  isWindowExpiryFailure: boolean
  /** The message the user was shown, which is not always the message the wallet threw. */
  swapErrorMessage: string
}

/**
 * Why the attempt failed, as far as the client can tell:
 * - `user-rejected` — the wallet prompt was declined
 * - `window-expired` — the blockhash died before the signature came back
 * - `squads-setup` — the SquadsX extension is not an active proposer on the Squad
 * - `app-data-mismatch` — the signed hash does not cover the doc being registered
 * - `insufficient-funds` — not enough SOL for fees or rent
 * - `order-book` — the order book refused the signed bundle
 * - `program-error` — the transaction reached simulation and a program rejected it
 * - `unknown` — everything else, which in practice is the wallet's own wording
 */
export type SolanaOrderErrorReason =
  | 'user-rejected'
  | 'window-expired'
  | 'squads-setup'
  | 'app-data-mismatch'
  | 'insufficient-funds'
  | 'order-book'
  | 'program-error'
  | 'unknown'

/**
 * How far the flow got before it threw:
 * - `plan` — building the order intent, before any wallet prompt
 * - `app-data-upload` — registering the appData doc with the order book
 * - `sign` — the wallet prompt is open (a self-paid send also broadcasts here)
 * - `submit` — the signed bundle is with the order book
 * - `register` — it went out and the local order is being recorded
 */
export type SolanaOrderPhase = 'plan' | 'app-data-upload' | 'sign' | 'submit' | 'register'

interface SolanaErrorChainEntry {
  name: string
  message: string
  code?: string | number
}

/** From `submit` on the transaction may already be placed; before it, nothing can have been. */
export function isSolanaOrderSubmitted(phase: SolanaOrderPhase): boolean {
  return SUBMITTED_PHASES.has(phase)
}

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
 *
 * @returns whether the failure was unexpected enough to report, which is also what makes it count as
 * the client having been unable to trade.
 */
export function reportSolanaOrderError({
  error,
  chainId,
  orderClass,
  phase,
  attempt,
  followsFailure,
  isSponsored,
  isRejection,
  isWindowExpiryFailure,
  swapErrorMessage,
}: ReportSolanaOrderErrorParams): boolean {
  const reason = classifySolanaOrderError({ error, isRejection, isWindowExpiryFailure })

  if (EXPECTED_REASONS.has(reason)) return false

  const logs = getSolanaErrorLogs(error)
  const chain = describeErrorChain(error)
  const sentryError = new Error(`Solana order submission failed: ${reason}`, { cause: error })
  sentryError.name = SENTRY_ERROR_NAME

  logger.warn(`${SENTRY_ERROR_NAME} (reason: ${reason}, phase: ${phase})`, { chainId, error })

  captureError(
    sentryError,
    ERROR_TYPES.ON_SWAP,
    {
      chainId,
      orderClass,
      reason,
      phase,
      attempt,
      isSponsored,
      swapErrorMessage,
      message: error.message,
      // A wallet that throws a bare "Unexpected error" leaves the chain of classes and the extra
      // properties it hung on them as the only description of what actually happened. Flattened to
      // strings because Sentry normalizes contexts to a depth of 3 by default, which would replace
      // every entry object in this array with "[Object]".
      errorChain: chain.map(formatErrorChainEntry),
      errorKeys: getOwnKeys(error),
      ...(logs ? { logs } : undefined),
      // Never reaches the order book on a mismatch, so this is the only record of what failed to hash.
      ...(error instanceof SolanaAppDataMismatchError && { fullAppData: error.fullAppData }),
    },
    {
      scope: SOLANA_ORDER_SENTRY_SCOPE,
      reason,
      phase,
      orderClass,
      sponsored: String(isSponsored),
      submissionStarted: String(isSolanaOrderSubmitted(phase)),
      errorName: chain[0]?.name ?? 'Unknown',
      followsFailure: String(followsFailure),
    },
    [SOLANA_ORDER_SENTRY_SCOPE, reason],
  )

  return true
}

function classifySolanaOrderError({
  error,
  isRejection,
  isWindowExpiryFailure,
}: Pick<ReportSolanaOrderErrorParams, 'error' | 'isRejection' | 'isWindowExpiryFailure'>): SolanaOrderErrorReason {
  if (isRejection) return 'user-rejected'
  if (isWindowExpiryFailure) return 'window-expired'
  if (isSquadsSetupError(error)) return 'squads-setup'
  if (error instanceof SolanaAppDataMismatchError) return 'app-data-mismatch'
  if (isInsufficientFundsProviderError(error)) return 'insufficient-funds'
  if (error instanceof OrderBookApiError) return 'order-book'
  if (getSolanaErrorLogs(error)) return 'program-error'

  return 'unknown'
}

/**
 * The class names, messages and error codes along the `cause` chain, outermost first. Wallet
 * adapters re-throw their own wrapper around the underlying failure, so the chain tells apart a
 * prompt the wallet refused from a send the network rejected even when every message is empty.
 */
function describeErrorChain(error: unknown, depth = 0): SolanaErrorChainEntry[] {
  if (!error || typeof error !== 'object' || depth > MAX_CAUSE_DEPTH) return []

  const { name, message, code } = error as { name?: unknown; message?: unknown; code?: unknown }
  const entry: SolanaErrorChainEntry = {
    name: typeof name === 'string' ? name : 'Unknown',
    message: typeof message === 'string' ? message : '',
    ...(typeof code === 'string' || typeof code === 'number' ? { code } : undefined),
  }

  return 'cause' in error ? [entry, ...describeErrorChain(error.cause, depth + 1)] : [entry]
}

function formatErrorChainEntry({ name, message, code }: SolanaErrorChainEntry): string {
  return `${name}${code === undefined ? '' : ` [${code}]`}: ${message}`
}

// `message`, `name` and `stack` are not enumerable on a real Error, so what is left is whatever the
// wallet attached — a `code`, a `data` blob, a nested `error` — and that is the part worth seeing.
function getOwnKeys(error: unknown): string[] {
  return error && typeof error === 'object' ? Object.keys(error).slice(0, MAX_ERROR_KEYS) : []
}
