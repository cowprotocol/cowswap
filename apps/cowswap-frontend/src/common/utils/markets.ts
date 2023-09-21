import { SupportedChainId } from '@cowprotocol/cow-sdk'

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
