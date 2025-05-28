import { atom } from 'jotai'

import { deepEqual } from '@cowprotocol/common-utils'
import { Fraction, Token } from '@uniswap/sdk-core'

import { UsdPriceStateKey } from '../types'
import { getUsdPriceStateKey } from '../utils/usdPriceStateKey'

export interface UsdRawPriceState {
  updatedAt?: number
  // When we couldn't load the price for any reaason (http error, invalid value, etc.), we set it to null
  price: Fraction | null
  currency: Token
  isLoading: boolean
}

export type UsdRawPrices = { [key: UsdPriceStateKey]: UsdRawPriceState }

const usdPriceQueueSubscribersCountAtom = atom<{ [key: UsdPriceStateKey]: number }>({})

export const currenciesUsdPriceQueueAtom = atom<{ [key: UsdPriceStateKey]: Token }>({})

export const usdRawPricesAtom = atom<UsdRawPrices>({})

export const addCurrencyToUsdPriceQueue = atom(null, (get, set, token: Token) => {
  const key = getUsdPriceStateKey(token)
  const usdPriceQueueSubscribersCount = get(usdPriceQueueSubscribersCountAtom)
  const currenciesToLoadUsdPrice = { ...get(currenciesUsdPriceQueueAtom) }

  const subscribersCount = (usdPriceQueueSubscribersCount[key] || 0) + 1

  // Increase the subscribers count
  set(usdPriceQueueSubscribersCountAtom, {
    ...usdPriceQueueSubscribersCount,
    [key]: subscribersCount,
  })

  if (!currenciesToLoadUsdPrice[key]) {
    set(currenciesUsdPriceQueueAtom, {
      ...currenciesToLoadUsdPrice,
      [key]: token,
    })
  }
})

export const removeCurrencyToUsdPriceFromQueue = atom(null, (get, set, token: Token) => {
  const key = getUsdPriceStateKey(token)
  const usdPriceQueueSubscribersCount = get(usdPriceQueueSubscribersCountAtom)
  const currenciesToLoadUsdPrice = { ...get(currenciesUsdPriceQueueAtom) }

  const subscribersCount = Math.max((usdPriceQueueSubscribersCount[key] || 0) - 1, 0)

  // Decrease the subscribers count
  set(usdPriceQueueSubscribersCountAtom, {
    ...usdPriceQueueSubscribersCount,
    [key]: subscribersCount,
  })

  // If there are no subscribers, then delete the token from queue
  if (subscribersCount === 0) {
    delete currenciesToLoadUsdPrice[key]

    set(currenciesUsdPriceQueueAtom, currenciesToLoadUsdPrice)
  }
})

export const setUsdPricesLoadingAtom = atom(null, (get, set, currencies: Token[]) => {
  const currentState = get(usdRawPricesAtom)
  const isLoading = true

  const newState = currencies.reduce<UsdRawPrices>((acc, token) => {
    const key = getUsdPriceStateKey(token)
    const state = currentState[key]

    acc[key] = state ? { ...state, isLoading } : { currency: token, isLoading, price: null }

    return acc
  }, {})

  if (!deepEqual(currentState, newState)) {
    set(usdRawPricesAtom, newState)
  }
})
