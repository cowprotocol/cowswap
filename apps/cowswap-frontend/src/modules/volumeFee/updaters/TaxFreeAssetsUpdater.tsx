import { useSetAtom } from 'jotai'

import { getCmsClient } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import useSWR, { SWRConfiguration } from 'swr'

import { taxFreeAssetsAtom } from '../state/taxFreeAssetsAtom'

type TokenId = string

type TaxFreeAssetItem = {
  attributes: {
    chainId: string
    tokenIds: string
  }
}

const UPDATE_INTERVAL = ms`1h`

const SWR_CONFIG: SWRConfiguration = {
  refreshInterval: UPDATE_INTERVAL,
  revalidateOnFocus: false,
}

const UPDATE_TIME_KEY = 'taxFreeAssetsUpdateTime'

const cmsClient = getCmsClient()

export function TaxFreeAssetsUpdater() {
  const setTaxFreeAssets = useSetAtom(taxFreeAssetsAtom)

  useSWR(
    ['/tax-free-assets', setTaxFreeAssets],
    async ([method, setTaxFreeAssets]) => {
      const lastUpdateTime = localStorage.getItem(UPDATE_TIME_KEY)

      // Update only once per interval in order to not load the CMS
      if (lastUpdateTime !== null && Date.now() - +lastUpdateTime < UPDATE_INTERVAL) {
        return
      }

      localStorage.setItem(UPDATE_TIME_KEY, Date.now().toString())

      const { data, error } = await cmsClient.GET(method, {
        params: {
          query: {
            fields: ['chainId', 'tokenIds'],
          },
          pagination: { pageSize: 500 },
        },
      })
      const items = data.data as TaxFreeAssetItem[]

      if (error) {
        console.error('Failed to fetch tax free assets', error)
        return undefined
      }

      const state = items.reduce(
        (acc, item) => {
          const chainId: SupportedChainId = (SupportedChainId as any)[item.attributes.chainId]
          const tokenIds = item.attributes.tokenIds.toLowerCase().split(',')

          acc[chainId].push(tokenIds)
          return acc
        },
        mapSupportedNetworks<TokenId[][]>(() => []),
      )

      setTaxFreeAssets(state)
    },
    SWR_CONFIG,
  )

  return null
}
