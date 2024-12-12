import { useSetAtom } from 'jotai'

import { getCmsClient } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import qs from 'qs'
import useSWR, { SWRConfiguration } from 'swr'

import { taxFreeAssetsAtom } from '../state/taxFreeAssetsAtom'

type TokenId = string

type TaxFreeAssetItem = {
  attributes: {
    tokenIds: string
    chainId: {
      data: {
        attributes: {
          chainId: number
        }
      }
    }
  }
}

const UPDATE_INTERVAL = ms`1h`

const SWR_CONFIG: SWRConfiguration = {
  refreshInterval: UPDATE_INTERVAL,
  revalidateOnFocus: false,
}

const UPDATE_TIME_KEY = 'taxFreeAssetsUpdateTime'

const cmsClient = getCmsClient()

const querySerializer = (params: any) => {
  return qs.stringify(params, { encodeValuesOnly: true, arrayFormat: 'brackets' })
}

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

      let items: TaxFreeAssetItem[] | null = null

      try {
        const { data, error } = await cmsClient.GET(method, {
          params: {
            query: {
              fields: ['tokenIds'],
              populate: {
                chainId: {
                  fields: ['chainId'],
                },
              },
            },
            pagination: { pageSize: 500 },
          },
          querySerializer,
        })

        items = data.data as TaxFreeAssetItem[]

        if (error) {
          localStorage.removeItem(UPDATE_TIME_KEY)
          console.error('Failed to fetch tax free assets', error)
          return undefined
        }
      } catch (e) {
        localStorage.removeItem(UPDATE_TIME_KEY)
        console.error('Failed to fetch tax free assets', e)
      }

      if (!items) return

      localStorage.setItem(UPDATE_TIME_KEY, Date.now().toString())

      const state = items.reduce(
        (acc, item) => {
          const chainId = item.attributes.chainId.data.attributes.chainId as SupportedChainId
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
