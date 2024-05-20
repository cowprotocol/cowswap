import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { USDC } from '@cowprotocol/common-const'
import { FractionUtils } from '@cowprotocol/common-utils'
import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { useWalletInfo } from '@cowprotocol/wallet'
import { Fraction, Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

import { getCowProtocolNativePrice } from '../apis/getCowProtocolNativePrice'
import { fetchCurrencyUsdPrice } from '../services/fetchCurrencyUsdPrice'
import {
  currenciesUsdPriceQueueAtom,
  setUsdPricesLoadingAtom,
  UsdRawPrices,
  usdRawPricesAtom,
  UsdRawPriceState,
} from '../state/usdRawPricesAtom'

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
    swrOptions
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

function usdcPriceLoader(chainId: SupportedChainId): () => Promise<Fraction | null> {
  let usdcPricePromise: Promise<number | null> | null = null

  return () => {
    // Cache the result to avoid fetching it multiple times
    if (!usdcPricePromise) {
      usdcPricePromise = getCowProtocolNativePrice(USDC[chainId])
    }

    return usdcPricePromise.then((usdcPrice) =>
      typeof usdcPrice === 'number' ? FractionUtils.fromNumber(usdcPrice) : null
    )
  }
}

async function processQueue(queue: Token[], getUsdcPrice: () => Promise<Fraction | null>): Promise<UsdRawPrices> {
  const results = await Promise.all(
    queue.map(async (currency) => {
      const state: UsdRawPriceState = {
        price: null,
        currency,
        isLoading: false,
      }

      try {
        const price = await fetchCurrencyUsdPrice(currency, getUsdcPrice)
        if (price) {
          state.price = price
          state.updatedAt = Date.now()
        }
      } catch (e) {
        console.debug(`[UsdPricesUpdater]: Failed to fetch price for`, currency.symbol)
      }

      return { [currency.address.toLowerCase()]: state }
    })
  )

  return results.reduce<UsdRawPrices>((acc, result) => ({ ...acc, ...result }), {})
}
