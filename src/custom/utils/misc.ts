import { SupportedChainId as ChainId } from 'constants/chains'
import { Market } from 'types/index'
import { OrderKind } from '@cowprotocol/contracts'

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
  // TODO: Implement smarter logic https://github.com/gnosis/gp-ui/issues/331

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
