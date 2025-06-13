import { SupportedChainId as ChainId, OrderKind } from '@cowprotocol/cow-sdk'
import { Percent } from '@uniswap/sdk-core'

import { isSellOrder } from './isSellOrder'

interface Market<T = string> {
  baseToken: T
  quoteToken: T
}

const PROVIDER_REJECT_REQUEST_CODES = [4001, -32000] // See https://eips.ethereum.org/EIPS/eip-1193
const PROVIDER_REJECT_REQUEST_ERROR_MESSAGES = [
  'User denied message signature',
  'User rejected',
  'User denied',
  'rejected transaction',
  'Transaction was rejected',
]

export const isTruthy = <T>(value: T | null | undefined | false): value is T => !!value

export const delay = <T = void>(ms = 100, result?: T): Promise<T> =>
  new Promise((resolve) => setTimeout(resolve, ms, result))

export function withTimeout<T>(promise: Promise<T>, ms: number, context?: string): Promise<T> {
  const failOnTimeout = delay(ms).then(() => {
    const errorMessage = 'Timeout after ' + ms + ' ms'
    throw new Error(context ? `${context}. ${errorMessage}` : errorMessage)
  })

  return Promise.race([promise, failOnTimeout])
}

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
    timeout = setTimeout(() => func(args), wait)
  }

  return debounced
}

export function isPromiseFulfilled<T>(
  promiseResult: PromiseSettledResult<T>
): promiseResult is PromiseFulfilledResult<T> {
  return promiseResult.status === 'fulfilled'
}

// To properly handle PromiseSettleResult which returns and object
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function getPromiseFulfilledValue<T, E = undefined>(
  promiseResult: PromiseSettledResult<T>,
  nonFulfilledReturn: E
) {
  return isPromiseFulfilled(promiseResult) ? promiseResult.value : nonFulfilledReturn
}

// TODO: Replace any with proper type definitions
// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-function-return-type
export const registerOnWindow = (registerMapping: Record<string, any>) => {
  Object.entries(registerMapping).forEach(([key, value]) => {
    // TODO: Replace any with proper type definitions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(window as any)[key] = value
  })
}

export function getChainIdValues(): ChainId[] {
  const ChainIdList = Object.values(ChainId)

  // cut in half as enums are always represented as key/value and then inverted
  // https://stackoverflow.com/a/51536142
  return ChainIdList.slice(ChainIdList.length / 2) as ChainId[]
}

export interface CanonicalMarketParams<T> {
  sellToken: T
  buyToken: T
  kind: OrderKind
}

export interface TokensFromMarketParams<T> extends Market<T> {
  kind: OrderKind
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
 * Convenient method to get the error message from the error raised by a provider.
 *
 * Some providers return some description in the error.message, and some others the error message is itself a String
 * with the error message
 */
export function getProviderErrorMessage(error: unknown): string | undefined {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error) return error.message as string
  return error?.toString()
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
// TODO: Add proper return type annotation
// TODO: Replace any with proper type definitions
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-explicit-any
export function isRejectRequestProviderError(error: any) {
  if (error) {
    // Check the error code is the user rejection as described in eip-1193
    if (PROVIDER_REJECT_REQUEST_CODES.includes(error.code)) {
      return true
    }

    // Check for some specific messages returned by some wallets when rejecting requests
    const message = getProviderErrorMessage(error)
    if (
      PROVIDER_REJECT_REQUEST_ERROR_MESSAGES.some(
        (rejectMessage) => message && rejectMessage && message.toLowerCase().includes(rejectMessage.toLowerCase())
      )
    ) {
      return true
    }
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

/**
 * Helper function that transforms Basis Points (BPS) into a percentage
 * @param percent
 */
export function bpsToPercent(bps: number): Percent {
  return new Percent(bps, 10000)
}
