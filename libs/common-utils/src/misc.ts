import { OrderKind, SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Percent } from '@cowprotocol/currency'

import { isSellOrder } from './isSellOrder'
import { createCowLogger } from './logger'

interface Market<T = string> {
  baseToken: T
  quoteToken: T
}

// 4001 is the standard EIP-1193 user rejection code.
// -32000 is a generic server error used by nodes for things like "intrinsic gas too low";
// it is NOT included here because relying on it alone causes node errors to be silently swallowed.
const PROVIDER_REJECT_REQUEST_CODES = [4001] // See https://eips.ethereum.org/EIPS/eip-1193
const PROVIDER_REJECT_REQUEST_ERROR_MESSAGES = [
  'User denied message signature',
  'User rejected',
  'User denied',
  'rejected transaction',
  'Transaction was rejected',
]

// Raw JSON-RPC messages returned by nodes (geth/erigon/anvil) when an account can't cover
// `gas * gas price + value`. Viem wraps these into an `InsufficientFundsError` (matched by name
// below) with its own reworded shortMessage, so the raw substrings only apply to unwrapped
// provider errors (e.g. a wallet returning the node message directly).
const INSUFFICIENT_FUNDS_ERROR_MESSAGES = ['insufficient funds', 'exceeds transaction sender account balance']

// Cap recursion when walking the error.cause chain, in case a provider produces a cyclic
// or pathologically deep chain.
const MAX_ERROR_CAUSE_DEPTH = 8

export const isTruthy = <T>(value: T | null | undefined | false): value is T => !!value

export const delay = <T = void>(ms = 100, result?: T): Promise<T> =>
  new Promise((resolve) => setTimeout(resolve, ms, result))

interface TimeoutOptions {
  timeout: number
  timeoutMessage: string
}

type WindowWithMapping = Window & typeof globalThis & Record<string, unknown>

export class TimeoutError extends Error {}

// TODO: Add proper return type annotation
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
export function debounce<F extends (...args: any) => any>(func: F, wait = 200) {
  let timeout: NodeJS.Timeout
  // TODO: Replace any with proper type definitions
  // TODO: Add proper return type annotation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
  const debounced = (...args: any) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }

  return debounced
}

// To properly handle PromiseSettleResult which returns and object
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getPromiseFulfilledValue<T, E = undefined>(
  promiseResult: PromiseSettledResult<T>,
  nonFulfilledReturn: E,
) {
  return isPromiseFulfilled(promiseResult) ? promiseResult.value : nonFulfilledReturn
}

export function isPromiseFulfilled<T>(
  promiseResult: PromiseSettledResult<T>,
): promiseResult is PromiseFulfilledResult<T> {
  return promiseResult.status === 'fulfilled'
}

export async function withTimeout<T>(promise: Promise<T>, options: TimeoutOptions): Promise<T> {
  const { timeout, timeoutMessage } = options
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const failOnTimeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new TimeoutError(timeoutMessage)), timeout)
  })

  return Promise.race([promise, failOnTimeout]).finally(() => {
    clearTimeout(timeoutId)
  })
}

export const registerOnWindow = (registerMapping: Record<string, unknown>): void => {
  if (typeof window === 'undefined') return

  Object.entries(registerMapping).forEach(([key, value]) => {
    ;(window as WindowWithMapping)[key] = value
    createCowLogger('AppMeta').info(key, value)
  })
}

export interface CanonicalMarketParams<T> {
  sellToken: T
  buyToken: T
  kind: OrderKind
}

export interface TokensFromMarketParams<T> extends Market<T> {
  kind: OrderKind
}

/**
 * Helper function that transforms Basis Points (BPS) into a percentage
 * @param percent
 */
export function bpsToPercent(bps: number): Percent {
  return new Percent(bps, 10000)
}

export function getCanonicalMarket<T>({ sellToken, buyToken, kind }: CanonicalMarketParams<T>): Market<T> {
  if (isSellOrder(kind)) {
    return {
      baseToken: sellToken,
      quoteToken: buyToken,
    }
  } else {
    return {
      baseToken: buyToken,
      quoteToken: sellToken,
    }
  }
}

export function getChainIdValues(): ChainId[] {
  const ChainIdList = Object.values(ChainId)

  // cut in half as enums are always represented as key/value and then inverted
  // https://stackoverflow.com/a/51536142
  return ChainIdList.slice(ChainIdList.length / 2) as ChainId[]
}

/**
 * Convenient method to get the error message from the error raised by a provider.
 *
 * Some providers return some description in the error.message, and some others the error message is itself a String
 * with the error message
 */
export function getProviderErrorMessage(error: unknown): string | undefined {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object') {
    // Prefer viem's shortMessage (concise, human-readable) over the full message
    // which includes verbose request arguments and hex data.
    if ('shortMessage' in error && typeof error.shortMessage === 'string') return error.shortMessage
    if ('message' in error && typeof error.message === 'string') return error.message
  }
  return error?.toString()
}

export function getTokensFromMarket<T>({
  quoteToken,
  baseToken,
  kind,
}: TokensFromMarketParams<T>): Omit<CanonicalMarketParams<T>, 'kind'> {
  if (isSellOrder(kind)) {
    return {
      sellToken: baseToken,
      buyToken: quoteToken,
    }
  } else {
    return {
      buyToken: baseToken,
      sellToken: quoteToken,
    }
  }
}

/**
 * Basic hashing function
 */
export function hashCode(text: string): number {
  let hash = 0,
    i,
    chr
  if (text.length === 0) return hash
  for (i = 0; i < text.length; i++) {
    chr = text.charCodeAt(i)
    hash = (hash << 5) - hash + chr
    hash |= 0 // Convert to 32bit integer
  }

  return hash
}

/**
 * @param error Optional error object returned by a provider when a transaction fails to submit
 * because the account can't cover `gas * gas price + value` — e.g. selling ~100% of an ETH
 * balance and picking a low gas setting, leaving nothing to pay for gas.
 *
 * @returns true if the error is an "insufficient funds for gas/value" failure
 */
export function isInsufficientFundsProviderError(error: unknown, depth = 0): boolean {
  if (!error || depth > MAX_ERROR_CAUSE_DEPTH) {
    return false
  }

  // Viem's `InsufficientFundsError` rewords the raw node message into its own shortMessage,
  // so it's matched by name rather than by string content.
  if (getErrorName(error) === 'InsufficientFundsError') {
    return true
  }

  const message = getProviderErrorMessage(error)
  if (message && matchesInsufficientFundsMessage(message)) {
    return true
  }

  const cause = getErrorCause(error)
  if (cause !== undefined && cause !== error) {
    return isInsufficientFundsProviderError(cause, depth + 1)
  }

  return false
}

/**
 *
 * @param error Optional error object return by a provider.
 *
 * There's no assumptions, the error can be undefined, it can contain an error code as described in https://eips.ethereum.org/EIPS/eip-1193
 * or it could be a String (as some wallets like Metamask used through WalletConnect return)
 *
 * @returns true if the user rejected the request in their wallet
 */
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isRejectRequestProviderError(error: any, depth = 0): boolean {
  if (!error || depth > MAX_ERROR_CAUSE_DEPTH) {
    return false
  }

  // Check the error code is the user rejection as described in eip-1193
  if (PROVIDER_REJECT_REQUEST_CODES.includes(error.code)) {
    return true
  }

  // Check for some specific messages returned by some wallets when rejecting requests
  const message = getProviderErrorMessage(error)
  if (
    PROVIDER_REJECT_REQUEST_ERROR_MESSAGES.some(
      (rejectMessage) => message && rejectMessage && message.toLowerCase().includes(rejectMessage.toLowerCase()),
    )
  ) {
    return true
  }

  // Some wallets (e.g. Safe/WalletConnect via viem) wrap the real 4001 rejection inside a
  // TransactionExecutionError whose top-level shortMessage is "An unknown RPC error occurred.".
  // The rejection code/message only lives on error.cause, so walk the chain.
  if (error.cause !== undefined && error.cause !== error) {
    return isRejectRequestProviderError(error.cause, depth + 1)
  }

  return false
}

/**
 * Helper function that transforms a percentage into Basis Points (BPS)
 * @param percent
 */
export function percentToBps(percent: Percent): number {
  return Number(percent.multiply('100').toSignificant())
}

function getErrorCause(error: unknown): unknown {
  return typeof error === 'object' && error !== null && 'cause' in error ? error.cause : undefined
}

function getErrorName(error: unknown): unknown {
  return typeof error === 'object' && error !== null && 'name' in error ? error.name : undefined
}

function matchesInsufficientFundsMessage(message: string): boolean {
  const lowerCaseMessage = message.toLowerCase()
  return INSUFFICIENT_FUNDS_ERROR_MESSAGES.some((needle) => lowerCaseMessage.includes(needle))
}
