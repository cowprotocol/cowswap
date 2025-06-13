import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { getWrappedToken } from '@cowprotocol/common-utils'
import { Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

import { useIsProviderNetworkUnsupported } from 'common/hooks/useIsProviderNetworkUnsupported'

import { fetchCurrencyUsdPrice } from '../services/fetchCurrencyUsdPrice'
import {
  currenciesUsdPriceQueueAtom,
  setUsdPricesLoadingAtom,
  UsdRawPrices,
  usdRawPricesAtom,
  UsdRawPriceState,
} from '../state/usdRawPricesAtom'
import { getUsdPriceStateKey } from '../utils/usdPriceStateKey'

const swrOptions: SWRConfiguration = {
  refreshInterval: ms`60s`,
  focusThrottleInterval: ms`30s`,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: true,
}

const EMPTY_USD_PRICES: UsdRawPrices = {}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function UsdPricesUpdater() {
  const setUsdPrices = useSetAtom(usdRawPricesAtom)
  const setUsdPricesLoading = useSetAtom(setUsdPricesLoadingAtom)
  const currenciesUsdPriceQueue = useAtomValue(currenciesUsdPriceQueueAtom)
  const isProviderNetworkUnsupported = useIsProviderNetworkUnsupported()

  const queue = useMemo(() => Object.values(currenciesUsdPriceQueue), [currenciesUsdPriceQueue])

  const swrResponse = useSWR<UsdRawPrices | null>(
    ['UsdPricesUpdater', queue],
    () => {
      setUsdPricesLoading(queue)

      return processQueue(queue)
    },
    swrOptions,
  )

  useEffect(() => {
    const { data, isLoading, error } = swrResponse

    if (isProviderNetworkUnsupported) {
      setUsdPrices(EMPTY_USD_PRICES)
      return
    }

    if (error) {
      console.error('Error loading USD prices', error)
      return
    }

    if (isLoading || !data) {
      return
    }

    setUsdPrices(data)
  }, [swrResponse, setUsdPrices, isProviderNetworkUnsupported])

  return null
}

async function processQueue(queue: Token[]): Promise<UsdRawPrices> {
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
        const price = await fetchCurrencyUsdPrice(wrappedCurrency)
        if (price) {
          state.price = price
          state.updatedAt = Date.now()
        }
      } catch {
        console.debug(`[UsdPricesUpdater]: Failed to fetch price for`, currency.symbol)
      }

      return { [getUsdPriceStateKey(currency)]: state }
    }),
  )

  return results.reduce<UsdRawPrices>((acc, result) => ({ ...acc, ...result }), {})
}
