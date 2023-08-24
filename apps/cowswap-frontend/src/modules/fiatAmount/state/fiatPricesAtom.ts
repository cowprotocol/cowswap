import { atom } from 'jotai'

import { Token } from '@uniswap/sdk-core'

import { deepEqual } from 'utils/deepEqual'

export interface FiatPriceState {
  updatedAt?: number
  price: number | null
  currency: Token
  isLoading: boolean
}

export type FiatPrices = { [tokenAddress: string]: FiatPriceState }

export const currenciesFiatPriceQueueAtom = atom<{ [tokenAddress: string]: Token }>({})

export const fiatPricesAtom = atom<FiatPrices>({})

export const addCurrencyToFiatPriceQueue = atom(null, (get, set, currency: Token) => {
  const currencyAddress = currency.address.toLowerCase()
  const currenciesToLoadFiatPrice = get(currenciesFiatPriceQueueAtom)

  if (!currenciesToLoadFiatPrice[currencyAddress]) {
    set(currenciesFiatPriceQueueAtom, {
      ...currenciesToLoadFiatPrice,
      [currencyAddress]: currency,
    })
  }
})

export const removeCurrencyToFiatPriceFromQueue = atom(null, (get, set, currency: Token) => {
  const currencyAddress = currency.address.toLowerCase()
  const currenciesToLoadFiatPrice = get(currenciesFiatPriceQueueAtom)

  if (currenciesToLoadFiatPrice[currencyAddress]) {
    const stateCopy = { ...currenciesToLoadFiatPrice }
    delete stateCopy[currencyAddress]

    set(currenciesFiatPriceQueueAtom, stateCopy)
  }
})

export const setFiatPricesLoadingAtom = atom(null, (get, set, currencies: Token[]) => {
  const currentState = get(fiatPricesAtom)
  const isLoading = true

  const newState = currencies.reduce<FiatPrices>((acc, token) => {
    const tokenAddress = token.address.toLowerCase()
    const state = currentState[tokenAddress]

    acc[tokenAddress] = state ? { ...state, isLoading } : { currency: token, isLoading, price: null }

    return acc
  }, {})

  if (!deepEqual(currentState, newState)) {
    set(fiatPricesAtom, newState)
  }
})
