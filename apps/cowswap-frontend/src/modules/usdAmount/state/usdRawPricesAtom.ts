import { atom } from 'jotai'

import { deepEqual } from '@cowprotocol/common-utils'
import { Fraction, Token } from '@uniswap/sdk-core'

export interface UsdRawPriceState {
  updatedAt?: number
  // When we couldn't load the price for any reaason (http error, invalid value, etc.), we set it to null
  price: Fraction | null
  currency: Token
  isLoading: boolean
}

export type UsdRawPrices = { [tokenAddress: string]: UsdRawPriceState }

const usdPriceQueueSubscribersCountAtom = atom<{ [tokenAddress: string]: number }>({})

export const currenciesUsdPriceQueueAtom = atom<{ [tokenAddress: string]: Token }>({})

export const usdRawPricesAtom = atom<UsdRawPrices>({})

export const addCurrencyToUsdPriceQueue = atom(null, (get, set, token: Token) => {
  const currencyAddress = token.address.toLowerCase()
  const usdPriceQueueSubscribersCount = get(usdPriceQueueSubscribersCountAtom)
  const currenciesToLoadUsdPrice = { ...get(currenciesUsdPriceQueueAtom) }

  const subscribersCount = (usdPriceQueueSubscribersCount[currencyAddress] || 0) + 1

  // Increase the subscribers count
  set(usdPriceQueueSubscribersCountAtom, {
    ...usdPriceQueueSubscribersCount,
    [currencyAddress]: subscribersCount,
  })

  if (!currenciesToLoadUsdPrice[currencyAddress]) {
    set(currenciesUsdPriceQueueAtom, {
      ...currenciesToLoadUsdPrice,
      [currencyAddress]: token,
    })
  }
})

export const removeCurrencyToUsdPriceFromQueue = atom(null, (get, set, token: Token) => {
  const currencyAddress = token.address.toLowerCase()
  const usdPriceQueueSubscribersCount = get(usdPriceQueueSubscribersCountAtom)
  const currenciesToLoadUsdPrice = { ...get(currenciesUsdPriceQueueAtom) }

  const subscribersCount = Math.max((usdPriceQueueSubscribersCount[currencyAddress] || 0) - 1, 0)

  // Decrease the subscribers count
  set(usdPriceQueueSubscribersCountAtom, {
    ...usdPriceQueueSubscribersCount,
    [currencyAddress]: subscribersCount,
  })

  // If there are no subscribers, then delete the token from queue
  if (subscribersCount === 0) {
    delete currenciesToLoadUsdPrice[currencyAddress]

    set(currenciesUsdPriceQueueAtom, currenciesToLoadUsdPrice)
  }
})

export const setUsdPricesLoadingAtom = atom(null, (get, set, currencies: Token[]) => {
  const currentState = get(usdRawPricesAtom)
  const isLoading = true

  const newState = currencies.reduce<UsdRawPrices>((acc, token) => {
    const tokenAddress = token.address.toLowerCase()
    const state = currentState[tokenAddress]

    acc[tokenAddress] = state ? { ...state, isLoading } : { currency: token, isLoading, price: null }

    return acc
  }, {})

  if (!deepEqual(currentState, newState)) {
    set(usdRawPricesAtom, newState)
  }
})
