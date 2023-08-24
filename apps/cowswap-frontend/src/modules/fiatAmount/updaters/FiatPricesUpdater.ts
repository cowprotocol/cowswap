import { useAtomValue, useSetAtom } from 'jotai'
import { useEffect, useMemo } from 'react'

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
  const currenciesFiatPriceQueue = useAtomValue(currenciesFiatPriceQueueAtom)

  const queue = useMemo(() => Object.values(currenciesFiatPriceQueue), [currenciesFiatPriceQueue])

  const swrResponse = useSWR<FiatPrices | null>(
    ['FiatPricesUpdater', queue],
    () => {
      const usdcPrice$ = getCowProtocolNativePrice(USDC[chainId])

      setFiatPricesLoading(queue)

      return processQueue(queue, usdcPrice$)
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

async function processQueue(queue: Token[], usdcPrice$: Promise<number | null>): Promise<FiatPrices> {
  const results = await Promise.all(
    queue.map((currency) => {
      return fetchCurrencyFiatPrice(currency, usdcPrice$).then((price) => {
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
