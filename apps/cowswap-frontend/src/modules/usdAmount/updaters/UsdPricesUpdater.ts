import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Fraction, Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

import { fetchCurrencyUsdPrice } from '../services/fetchCurrencyUsdPrice'
import {
  currenciesUsdPriceQueueAtom,
  setUsdPricesLoadingAtom,
  UsdRawPrices,
  usdRawPricesAtom,
  UsdRawPriceState,
} from '../state/usdRawPricesAtom'
import { usdcPriceLoader } from '../utils/usdcPriceLoader'

const swrOptions: SWRConfiguration = {
  refreshInterval: ms`60s`,
  focusThrottleInterval: ms`30s`,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: true,
}

export function UsdPricesUpdater() {
  const { chainId } = useWalletInfo()
  const setUsdPrices = useSetAtom(usdRawPricesAtom)
  const setUsdPricesLoading = useSetAtom(setUsdPricesLoadingAtom)
  const currenciesUsdPriceQueue = useAtomValue(currenciesUsdPriceQueueAtom)

  const queue = useMemo(() => Object.values(currenciesUsdPriceQueue), [currenciesUsdPriceQueue])

  const swrResponse = useSWR<UsdRawPrices | null>(
    ['UsdPricesUpdater', queue, chainId],
    () => {
      const getUsdcPrice = usdcPriceLoader(chainId)

      setUsdPricesLoading(queue)

      return processQueue(queue, getUsdcPrice)
    },
    swrOptions,
  )

  useEffect(() => {
    const { data, isLoading, error } = swrResponse

    if (error) {
      console.error('Error loading USD prices', error)
      return
    }

    if (isLoading || !data) {
      return
    }

    setUsdPrices(data)
  }, [swrResponse, setUsdPrices])

  return null
}

async function processQueue(queue: Token[], getUsdcPrice: () => Promise<Fraction | null>): Promise<UsdRawPrices> {
  const results = await Promise.all(
    queue.map(async (currency) => {
      const state: UsdRawPriceState = {
        price: null,
        currency,
        isLoading: false,
      }

      // To avoid querying native assets directly, used the wrapped version instead
      const wrappedCurrency = getWrappedToken(currency)

      try {
        const price = await fetchCurrencyUsdPrice(wrappedCurrency, getUsdcPrice)
        if (price) {
          state.price = price
          state.updatedAt = Date.now()
        }
      } catch {
        console.debug(`[UsdPricesUpdater]: Failed to fetch price for`, currency.symbol)
      }

      return { [currency.address.toLowerCase()]: state }
    }),
  )

  return results.reduce<UsdRawPrices>((acc, result) => ({ ...acc, ...result }), {})
}
