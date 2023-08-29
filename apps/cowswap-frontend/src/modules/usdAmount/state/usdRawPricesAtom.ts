import { atom } from 'jotai'

import { Token } from '@uniswap/sdk-core'

import { deepEqual } from 'utils/deepEqual'

export interface UsdRawPriceState {
  updatedAt?: number
  price: number | null
  currency: Token
  isLoading: boolean
}

export type UsdRawPrices = { [tokenAddress: string]: UsdRawPriceState }

export const currenciesUsdPriceQueueAtom = atom<{ [tokenAddress: string]: Token }>({})

export const usdRawPricesAtom = atom<UsdRawPrices>({})

export const addCurrencyToUsdPriceQueue = atom(null, (get, set, currency: Token) => {
  const currencyAddress = currency.address.toLowerCase()
  const currenciesToLoadUsdPrice = get(currenciesUsdPriceQueueAtom)

  if (!currenciesToLoadUsdPrice[currencyAddress]) {
    set(currenciesUsdPriceQueueAtom, {
      ...currenciesToLoadUsdPrice,
      [currencyAddress]: currency,
    })
  }
})

export const removeCurrencyToUsdPriceFromQueue = atom(null, (get, set, currency: Token) => {
  const currencyAddress = currency.address.toLowerCase()
  const currenciesToLoadUsdPrice = get(currenciesUsdPriceQueueAtom)

  if (currenciesToLoadUsdPrice[currencyAddress]) {
    const stateCopy = { ...currenciesToLoadUsdPrice }
    delete stateCopy[currencyAddress]

    set(currenciesUsdPriceQueueAtom, stateCopy)
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

export const resetUsdPricesAtom = atom(null, (get, set, currencies: Token[]) => {
  const currentState = get(usdRawPricesAtom)
  const isLoading = false

  const newState = currencies.reduce<UsdRawPrices>((acc, token) => {
    const tokenAddress = token.address.toLowerCase()

    acc[tokenAddress] = { currency: token, isLoading, price: null }

    return acc
  }, {})

  if (!deepEqual(currentState, newState)) {
    set(usdRawPricesAtom, newState)
  }
})
