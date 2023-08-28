import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

import { SupportedChainId } from '@cowprotocol/cow-sdk'
import { Token } from '@uniswap/sdk-core'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

import { USDC } from 'legacy/constants/tokens'

import { useWalletInfo } from 'modules/wallet'

import { getCowProtocolNativePrice } from '../apis/getCowProtocolNativePrice'
import { fetchCurrencyFiatPrice } from '../services/fetchCurrencyFiatPrice'
import {
  currenciesFiatPriceQueueAtom,
  FiatPrices,
  fiatPricesAtom,
  FiatPriceState,
  resetFiatPricesAtom,
  setFiatPricesLoadingAtom,
} from '../state/fiatPricesAtom'

const swrOptions: SWRConfiguration = {
  refreshInterval: ms`30s`,
  refreshWhenHidden: false,
  refreshWhenOffline: false,
  revalidateOnFocus: true,
}

export function FiatPricesUpdater() {
  const { chainId } = useWalletInfo()
  const setFiatPrices = useSetAtom(fiatPricesAtom)
  const setFiatPricesLoading = useSetAtom(setFiatPricesLoadingAtom)
  const resetFiatPrices = useSetAtom(resetFiatPricesAtom)
  const currenciesFiatPriceQueue = useAtomValue(currenciesFiatPriceQueueAtom)

  const queue = useMemo(() => Object.values(currenciesFiatPriceQueue), [currenciesFiatPriceQueue])

  const swrResponse = useSWR<FiatPrices | null>(
    ['FiatPricesUpdater', queue, chainId],
    () => {
      const getUsdcPrice = usdcPriceLoader(chainId)

      setFiatPricesLoading(queue)

      return processQueue(queue, getUsdcPrice).catch((error) => {
        resetFiatPrices(queue)

        return Promise.reject(error)
      })
    },
    swrOptions
  )

  useEffect(() => {
    const { data, isLoading, error } = swrResponse

    if (error) {
      console.error('Error loading fiat prices', error)
      return
    }

    if (isLoading || !data) {
      return
    }

    setFiatPrices(data)
  }, [swrResponse, setFiatPrices])

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

async function processQueue(queue: Token[], getUsdcPrice: () => Promise<number | null>): Promise<FiatPrices> {
  const results = await Promise.all(
    queue.map((currency) => {
      return fetchCurrencyFiatPrice(currency, getUsdcPrice).then((price) => {
        if (typeof price !== 'number') {
          return null
        }

        const state: FiatPriceState = {
          updatedAt: Date.now(),
          price,
          currency,
          isLoading: false,
        }

        return { [currency.address.toLowerCase()]: state }
      })
    })
  )

  return results.reduce<FiatPrices>((acc, result) => ({ ...acc, ...result }), {})
}
