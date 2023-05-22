import { SupportedChainId as ChainId } from '@cowprotocol/cow-sdk'
import { Market } from 'legacy/types'
import { OrderKind } from '@cowprotocol/cow-sdk'
import { Percent } from '@uniswap/sdk-core'

const PROVIDER_REJECT_REQUEST_CODES = [4001, -32000] // See https://eips.ethereum.org/EIPS/eip-1193
const PROVIDER_REJECT_REQUEST_ERROR_MESSAGES = [
  'User denied message signature',
  'User rejected the transaction',
  'user rejected transaction',
  'User rejected signing',
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

export function debounce<F extends (...args: any) => any>(func: F, wait = 200) {
  let timeout: NodeJS.Timeout
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
export function getPromiseFulfilledValue<T, E = undefined>(
  promiseResult: PromiseSettledResult<T>,
  nonFulfilledReturn: E
) {
  return isPromiseFulfilled(promiseResult) ? promiseResult.value : nonFulfilledReturn
}

export const registerOnWindow = (registerMapping: Record<string, any>) => {
  Object.entries(registerMapping).forEach(([key, value]) => {
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
  // TODO: Implement smarter logic https://github.com/cowprotocol/explorer/issues/9

  // Not big reasoning on my selection of what is base and what is quote (important thing in this PR is just to do a consistent selection)
  // The used reasoning is:
  //    - If I sell apples, the quote is EUR (buy token)
  //    - If I buy apples, the quote is EUR (sell token)
  if (kind === OrderKind.SELL) {
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
  if (kind === OrderKind.SELL) {
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
export function getProviderErrorMessage(error: any) {
  return typeof error === 'string' ? error : error.message
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
export function isRejectRequestProviderError(error: any) {
  if (error) {
    // Check the error code is the user rejection as described in eip-1193
    if (PROVIDER_REJECT_REQUEST_CODES.includes(error.code)) {
      return true
    }

    // Check for some specific messages returned by some wallets when rejecting requests
    const message = getProviderErrorMessage(error)
    if (
      PROVIDER_REJECT_REQUEST_ERROR_MESSAGES.some((rejectMessage) =>
        message.toLowerCase().includes(rejectMessage.toLowerCase())
      )
    ) {
      return true
    }
  }

  return false
}

/**
 * Helper function that transforms a Percent instance into the correspondent BIPS value as a string
 * @param percent
 */
export function percentToBips(percent: Percent): string {
  return percent.multiply('100').toSignificant()
}
