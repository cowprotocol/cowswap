import { useSetAtom } from 'jotai'

import { components } from '@cowprotocol/cms'
import { getCmsClient } from '@cowprotocol/core'
import { mapSupportedNetworks, SupportedChainId } from '@cowprotocol/cow-sdk'

import ms from 'ms.macro'
import qs from 'qs'
import useSWR, { SWRConfiguration } from 'swr'

import { CorrelatedTokens, correlatedTokensAtom } from '../state/correlatedTokensAtom'

type CorrelatedTokenItem = components['schemas']['CorrelatedTokenListResponseDataItem']

const UPDATE_INTERVAL = ms`10m`

const SWR_CONFIG: SWRConfiguration = {
  refreshInterval: UPDATE_INTERVAL,
  revalidateOnFocus: false,
}

const UPDATE_TIME_KEY = 'correlatedTokensUpdateTime'

const cmsClient = getCmsClient()

const querySerializer = (params: unknown): string => {
  return qs.stringify(params, { encodeValuesOnly: true, arrayFormat: 'brackets' })
}

export function CorrelatedTokensUpdater(): null {
  const correlatedTokens = useSetAtom(correlatedTokensAtom)

  useSWR(
    ['/correlated-tokens', correlatedTokens],
    async ([method, setCorrelatedTokens]) => {
      const lastUpdateTime = localStorage.getItem(UPDATE_TIME_KEY)

      // Update only once per interval in order to not load the CMS
      if (lastUpdateTime !== null && Date.now() - +lastUpdateTime < UPDATE_INTERVAL) {
        return
      }

      let items: CorrelatedTokenItem[] | null = null

      try {
        const { data, error } = await cmsClient.GET(method, {
          params: {
            query: {
              fields: ['tokens'],
              populate: {
                network: {
                  fields: ['chainId'],
                },
              },
            },
            pagination: { pageSize: 500 },
          },
          querySerializer,
        })

        items = data.data as CorrelatedTokenItem[]

        if (error) {
          localStorage.removeItem(UPDATE_TIME_KEY)
          console.error('Failed to fetch correlated tokens', error)
          return undefined
        }
      } catch (e) {
        localStorage.removeItem(UPDATE_TIME_KEY)
        console.error('Failed to fetch correlated tokens', e)
      }

      if (!items) return

      localStorage.setItem(UPDATE_TIME_KEY, Date.now().toString())

      const state = items.reduce(
        (acc, item) => {
          if (!item.attributes?.network?.data?.attributes?.chainId || !item.attributes?.tokens) {
            return acc
          }
          const chainId = item.attributes.network.data.attributes.chainId as SupportedChainId

          // It's possible checksummed token addresses were manually added
          const tokens = item.attributes.tokens as CorrelatedTokens
          const lowerCasedTokens = Object.keys(tokens).reduce<CorrelatedTokens>((acc, address) => {
            acc[address.toLowerCase()] = tokens[address]
            return acc
          }, {})

          acc[chainId].push(lowerCasedTokens)
          return acc
        },
        mapSupportedNetworks<CorrelatedTokens[]>(() => []),
      )

      setCorrelatedTokens(state)
    },
    SWR_CONFIG,
  )

  return null
}
