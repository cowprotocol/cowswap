import { useSetAtom } from 'jotai'
import { useCallback, useEffect } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'
import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import useSWR from 'swr'

import { getSurplusData } from 'api/cowProtocol/api'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

import { totalSurplusAtom } from './atoms'

export function TotalSurplusUpdater(): null {
  const { chainId, account } = useWalletInfo()
  const nativeCurrency = useNativeCurrency()
  const setTotalSurplus = useSetAtom(totalSurplusAtom)

  const fetcher = useCallback(
    async ([, chainId, account]: [string, number, string]) => {
      const surplusData = await getSurplusData(chainId, account)

      if (!surplusData?.totalSurplus) {
        return null
      }

      return CurrencyAmount.fromRawAmount(nativeCurrency, surplusData.totalSurplus)
    },
    [nativeCurrency]
  )

  const {
    data: surplusAmount,
    isLoading,
    error,
    mutate: refetch,
  } = useSWR<CurrencyAmount<Currency> | null>(
    // Don't load if required params are missing: https://swr.vercel.app/docs/conditional-fetching
    chainId && account ? ['getSurplusData', chainId, account] : null,
    fetcher
  )

  useEffect(() => {
    setTotalSurplus({ surplusAmount, isLoading, error, refetch })
  }, [error, isLoading, refetch, setTotalSurplus, surplusAmount])

  return null
}
