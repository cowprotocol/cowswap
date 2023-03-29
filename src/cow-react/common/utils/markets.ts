import invariant from 'tiny-invariant'
import { SupportedChainId } from 'constants/chains'
import { Currency, Price } from '@uniswap/sdk-core'

/**
 * Convenient method to identify a market so it doesn't matter what is the sell token or buy token.
 *
 * This methods is used internally for example to identify the keys in hash maps caches.
 * This method has the communitative property, so getCanonicalMarketKey(A, B) = getCanonicalMarketKey(B, A)
 *
 * @param tokenAddressA
 * @param tokenAddressB
 * @returns A string with the key
 */
export function getCanonicalMarketKey(
  tokenAddressA: string,
  tokenAddressB: string
): { marketKey: string; marketInverted: boolean } {
  const tokenAddressALower = tokenAddressA.toLocaleLowerCase()
  const tokenAddressBLower = tokenAddressB.toLocaleLowerCase()
  const marketInverted = tokenAddressALower > tokenAddressBLower

  return {
    marketKey: marketInverted
      ? `${tokenAddressBLower}/${tokenAddressALower}`
      : `${tokenAddressALower}/${tokenAddressBLower}`,
    marketInverted,
  }
}

/**
 * Convenient method to identify a market so it doesn't matter what is the sell token or buy token.
 *
 * This methods is used internally for example to identify the keys in hash maps caches.
 * This method has the communitative property, so getCanonicalMarketChainKey(chainId, A, B) = getCanonicalMarketChainKey(chainId, B, A)
 *
 * @param tokenAddressA
 * @param tokenAddressB
 * @returns A string with the key
 */
export function getCanonicalMarketChainKey(
  chainId: SupportedChainId,
  tokenAddressA: string,
  tokenAddressB: string
): { marketKey: string; marketInverted: boolean } {
  const { marketKey, marketInverted } = getCanonicalMarketKey(tokenAddressA, tokenAddressB)

  return {
    marketKey: `${chainId}@${marketKey}`,
    marketInverted,
  }
}

export function assertSameMarket(price1: Price<Currency, Currency>, price2: Price<Currency, Currency>) {
  // Assert I'm comparing apples with apples (prices should refer to market)
  invariant(
    price1.baseCurrency.equals(price2.baseCurrency) && price1.quoteCurrency.equals(price2.quoteCurrency),
    'Prices are not from the same market'
  )
}
