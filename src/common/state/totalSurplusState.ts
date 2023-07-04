import { atom, useAtomValue } from 'jotai'
import { useUpdateAtom } from 'jotai/utils'

import { Currency, CurrencyAmount } from '@uniswap/sdk-core'

import useSWR from 'swr'
import { Nullish } from 'types'

import { useWalletInfo } from 'modules/wallet'

import { getSurplusData } from 'api/gnosisProtocol/api'
import useNativeCurrency from 'lib/hooks/useNativeCurrency'

export type TotalSurplusState = {
  surplusAmount: Nullish<CurrencyAmount<Currency>>
  isLoading: boolean
  error: string
}

const totalSurplusAtom = atom<TotalSurplusState>({
  surplusAmount: null,

  isLoading: false,

  error: '',
})

export function TotalSurplusUpdater(): null {
  const { chainId, account } = useWalletInfo()
  const nativeCurrency = useNativeCurrency()
  const setTotalSurplus = useUpdateAtom(totalSurplusAtom)

  const {
    data: surplusAmount,
    isLoading,
    error,
  } = useSWR<CurrencyAmount<Currency> | null>(
    // Don't load if required params are missing: https://swr.vercel.app/docs/conditional-fetching
    chainId && account ? ['getSurplusData', chainId, account] : null,
    async ([, chainId, account]: [string, number, string]) => {
      const surplusData = await getSurplusData(chainId, account)

      if (!surplusData?.totalSurplus) {
        return null
      }

      return CurrencyAmount.fromRawAmount(nativeCurrency, surplusData.totalSurplus)
    }
  )

  setTotalSurplus({ surplusAmount, isLoading, error })

  return null
}

export function useTotalSurplus(): TotalSurplusState {
  return useAtomValue(totalSurplusAtom)
}
