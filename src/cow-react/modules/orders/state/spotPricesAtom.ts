import { atom, useAtomValue } from 'jotai'
import { Currency, Price } from '@uniswap/sdk-core'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { getCanonicalMarketChainKey } from '@cow/common/utils/markets'
import { useCallback } from 'react'

export type SpotPrices = Record<string, Price<Currency, Currency>>

export type SpotPricesKeyParams = {
  chainId: SupportedChainId
  sellTokenAddress: string
  buyTokenAddress: string
}

export type UpdateSpotPriceAtom = SpotPricesKeyParams & {
  price: Price<Currency, Currency>
}
export const spotPricesAtom = atom<SpotPrices>({})

export const updateSpotPricesAtom = atom(null, (get, set, params: UpdateSpotPriceAtom) => {
  set(spotPricesAtom, () => {
    const { price, ...rest } = params

    const prevState = get(spotPricesAtom)
    const previousPrice = getSpotPrice(rest, prevState)

    if (previousPrice?.equalTo(price)) {
      // Avoid unnecessary updates if price hasn't changed
      return prevState
    }

    const { chainId, sellTokenAddress, buyTokenAddress } = rest
    const { marketKey, marketInverted } = getCanonicalMarketChainKey(chainId, sellTokenAddress, buyTokenAddress)
    return { ...prevState, [marketKey]: marketInverted ? price.invert() : price }
  })
})

/**
 * Get Spot Price
 *
 * Helper function to get the spot price from the spot prices map
 * Syntactic sugar to build the key and search the map
 *
 * @param params {chainId, sellTokenAddress, buyTokenAddress}
 * @param spotPrices Spot prices map
 */
function getSpotPrice(params: SpotPricesKeyParams, spotPrices: SpotPrices): Price<Currency, Currency> | null {
  const { chainId, sellTokenAddress, buyTokenAddress } = params
  const { marketKey, marketInverted } = getCanonicalMarketChainKey(chainId, sellTokenAddress, buyTokenAddress)
  const spotPrice = spotPrices[marketKey]

  if (!spotPrice) {
    return null
  }

  return marketInverted ? spotPrice.invert() : spotPrice
}

export function useGetSpotPrice() {
  const spotPrices = useAtomValue(spotPricesAtom)
  return useCallback((params: SpotPricesKeyParams) => getSpotPrice(params, spotPrices), [spotPrices])
}
