import { atom } from 'jotai'

import { Fraction, Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'

import { deepEqual } from 'utils/deepEqual'

export interface UsdRawPriceState {
  updatedAt?: number
  price: Fraction | null
  currency: Token
  isLoading: boolean
}

export type UsdRawPrices = { [tokenAddress: string]: UsdRawPriceState }

const DELETION_FROM_QUEUE_DEBOUNCE = ms`5s`

export const currenciesUsdPriceQueueAtom = atom<{ [tokenAddress: string]: Token }>({})

export const usdRawPricesAtom = atom<UsdRawPrices>({})

const currenciesToDeleteFromQueueAtom = atom<{ [tokenAddress: string]: Token | undefined }>({})

export const addCurrencyToUsdPriceQueue = atom(null, (get, set, currency: Token) => {
  const currencyAddress = currency.address.toLowerCase()
  const currenciesToLoadUsdPrice = get(currenciesUsdPriceQueueAtom)

  // Remove the currency from deletion queue
  set(currenciesToDeleteFromQueueAtom, { ...get(currenciesToDeleteFromQueueAtom), [currencyAddress]: undefined })

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
  const currenciesToDeleteFromQueue = get(currenciesToDeleteFromQueueAtom)

  const isCurrencyInUsdPriceQueue = !!currenciesToLoadUsdPrice[currencyAddress]
  const isCurrencyInDeletionQueue = !!currenciesToDeleteFromQueue[currencyAddress]

  if (isCurrencyInUsdPriceQueue && !isCurrencyInDeletionQueue) {
    // Add the currency from deletion queue
    set(currenciesToDeleteFromQueueAtom, { ...currenciesToDeleteFromQueue, [currencyAddress]: currency })

    setTimeout(() => {
      const currenciesToLoadUsdPrice = { ...get(currenciesUsdPriceQueueAtom) }

      // Remove the currency from USD price queue only if it's not added again
      if (get(currenciesToDeleteFromQueueAtom)[currencyAddress]) {
        set(currenciesToDeleteFromQueueAtom, { ...get(currenciesToDeleteFromQueueAtom), [currencyAddress]: undefined })

        delete currenciesToLoadUsdPrice[currencyAddress]

        set(currenciesUsdPriceQueueAtom, currenciesToLoadUsdPrice)
      }
    }, DELETION_FROM_QUEUE_DEBOUNCE)
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
