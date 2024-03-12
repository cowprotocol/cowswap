import { useMemo } from 'react'

import { useWalletInfo } from '@cowprotocol/wallet'

import ms from 'ms.macro'
import useSWR from 'swr'

import { analyzeNfaSources } from '../services/analyzeNfaSources'
import { NfaSourceData } from '../types'

export const UPDATE_INTERVAL = ms`30s`
const API_URL = 'https://cow-web-services-git-feat-nfa-cowswap.vercel.app/api/serverless/nfa'

export function useGetNFAMessages() {
  const { chainId } = useWalletInfo()

  const { data } = useSWR<NfaSourceData[]>(
    [API_URL],
    () => {
      return fetch(API_URL)
        .then((res) => res.json())
        .then((res) => res.map((item: NfaSourceData) => ({ ...item, token: `0x${item.token}` })))
    },
    { refreshInterval: UPDATE_INTERVAL }
  )

  return useMemo(() => {
    if (!data) return []

    return analyzeNfaSources(data, chainId)
  }, [data])
}
