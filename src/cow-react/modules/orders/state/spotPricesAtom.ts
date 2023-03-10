import { atom } from 'jotai'
import { Currency, Price } from '@uniswap/sdk-core'

import { SupportedChainId } from 'constants/chains'

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

    const key = buildSpotPricesKey(rest)
    const prevState = get(spotPricesAtom)

    if (prevState[key]?.equalTo(price)) {
      // Avoid unnecessary updates if price hasn't changed
      return prevState
    }

    return { ...prevState, [key]: price }
  })
})

/**
 * Build Spot Prices Key
 *
 * Helper function to build the key used to store spot prices
 * With this we can make the search faster and keep the structure flat
 *
 * @param params {chainId, sellTokenAddress, buyTokenAddress}
 */
export function buildSpotPricesKey(params: SpotPricesKeyParams): string {
  return Object.values(params)
    .map((v) => String(v).toLowerCase())
    .join('|')
}

/**
 * Get Spot Price
 *
 * Helper function to get the spot price from the spot prices map
 * Syntactic sugar to build the key and search the map
 *
 * @param params {chainId, sellTokenAddress, buyTokenAddress}
 * @param spotPrices Spot prices map
 */
export function getSpotPrice(params: SpotPricesKeyParams, spotPrices: SpotPrices): Price<Currency, Currency> | null {
  const key = buildSpotPricesKey(params)

  return spotPrices[key] || null
}
