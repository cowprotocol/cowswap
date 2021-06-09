import { ChainId } from '@uniswap/sdk'
import { Market } from 'types/index'

export const isTruthy = <T>(value: T | null | undefined | false): value is T => !!value

export const delay = <T = void>(ms = 100, result?: T): Promise<T> =>
  new Promise(resolve => setTimeout(resolve, ms, result))

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
  kind: string
}

export function getCanonicalMarket<T>({ sellToken, buyToken, kind }: CanonicalMarketParams<T>): Market<T> {
  // TODO: Implement smarter logic https://github.com/gnosis/gp-ui/issues/331

  // Not big reasoning on my selection of what is base and what is quote (important thing in this PR is just to do a consistent selection)
  // The used reasoning is:
  //    - If I sell apples, the quote is EUR (buy token)
  //    - If I buy apples, the quote is EUR (sell token)
  if (kind === 'sell') {
    return {
      baseToken: sellToken,
      quoteToken: buyToken
    }
  } else {
    return {
      baseToken: buyToken,
      quoteToken: sellToken
    }
  }
}
