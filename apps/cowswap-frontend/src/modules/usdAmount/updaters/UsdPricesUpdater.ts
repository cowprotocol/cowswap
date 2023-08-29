import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

import { USDC } from 'legacy/constants/tokens'

import { useWalletInfo } from 'modules/wallet'

import { getCowProtocolNativePrice } from '../apis/getCowProtocolNativePrice'
import { fetchCurrencyUsdPrice } from '../services/fetchCurrencyUsdPrice'
import {
  currenciesUsdPriceQueueAtom,
  UsdRawPrices,
  usdRawPricesAtom,
  UsdRawPriceState,
  resetUsdPricesAtom,
  setUsdPricesLoadingAtom,
} from '../state/usdRawPricesAtom'

const swrOptions: SWRConfiguration = {
  refreshInterval: ms`30s`,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: true,
}

export function UsdPricesUpdater() {
  const { chainId } = useWalletInfo()
  const setUsdPrices = useSetAtom(usdRawPricesAtom)
  const setUsdPricesLoading = useSetAtom(setUsdPricesLoadingAtom)
  const resetUsdPrices = useSetAtom(resetUsdPricesAtom)
  const currenciesUsdPriceQueue = useAtomValue(currenciesUsdPriceQueueAtom)

  const queue = useMemo(() => Object.values(currenciesUsdPriceQueue), [currenciesUsdPriceQueue])

  const swrResponse = useSWR<UsdRawPrices | null>(
    ['UsdPricesUpdater', queue, chainId],
    () => {
      const getUsdcPrice = usdcPriceLoader(chainId)

      setUsdPricesLoading(queue)

      return processQueue(queue, getUsdcPrice).catch((error) => {
        resetUsdPrices(queue)

        return Promise.reject(error)
      })
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

function usdcPriceLoader(chainId: SupportedChainId): () => Promise<number | null> {
  let usdcPricePromise: Promise<number | null> | null = null

  return () => {
    // Cache the result to avoid fetching it multiple times
    if (!usdcPricePromise) {
      usdcPricePromise = getCowProtocolNativePrice(USDC[chainId])
    }

    return usdcPricePromise
  }
}

async function processQueue(queue: Token[], getUsdcPrice: () => Promise<number | null>): Promise<UsdRawPrices> {
  const results = await Promise.all(
    queue.map((currency) => {
      return fetchCurrencyUsdPrice(currency, getUsdcPrice).then((price) => {
        if (typeof price !== 'number') {
          return null
        }

        const state: UsdRawPriceState = {
          updatedAt: Date.now(),
          price,
          currency,
          isLoading: false,
        }

        return { [currency.address.toLowerCase()]: state }
      })
    })
  )

  return results.reduce<UsdRawPrices>((acc, result) => ({ ...acc, ...result }), {})
}
