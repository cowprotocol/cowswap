import { useSetAtom } from 'jotai'

import { components } from '@cowprotocol/cms'
import { isSupportedChainId } from '@cowprotocol/common-utils'
import { getProdCmsClient } from '@cowprotocol/core'
import { getAddressKey, mapSupportedNetworks } from '@cowprotocol/cow-sdk'

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

const cmsClient = getProdCmsClient()

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

        if (error) {
          localStorage.removeItem(UPDATE_TIME_KEY)
          console.error('Failed to fetch correlated tokens', error)
          return undefined
        }

        const items = data.data as CorrelatedTokenItem[]

        let skipped = 0

        const state = items.reduce(
          (acc, item) => {
            const chainId = item.attributes?.network?.data?.attributes?.chainId

            if (!chainId || !item.attributes?.tokens || !isSupportedChainId(chainId)) {
              skipped++
              return acc
            }

            // It's possible checksummed token addresses were manually added
            const tokens = item.attributes.tokens as CorrelatedTokens
            const lowerCasedTokens = Object.keys(tokens).reduce<CorrelatedTokens>((acc, address) => {
              acc[getAddressKey(address)] = tokens[address]
              return acc
            }, {})

            acc[chainId].push(lowerCasedTokens)
            return acc
          },
          mapSupportedNetworks<CorrelatedTokens[]>(() => []),
        )

        if (skipped > 0) {
          console.warn(
            `Skipped ${skipped}/${items.length} correlated token lists with a missing or unsupported chainId`,
          )
        }

        // Never cache an all-empty result: it silently re-enables the volume fee on correlated pairs
        if (!Object.values(state).some((lists) => lists.length > 0)) {
          console.error('Correlated tokens resolved to empty for every chain, not persisting')
          return undefined
        }

        localStorage.setItem(UPDATE_TIME_KEY, Date.now().toString())
        setCorrelatedTokens(state)
      } catch (e) {
        localStorage.removeItem(UPDATE_TIME_KEY)
        console.error('Failed to fetch correlated tokens', e)
      }
    },
    SWR_CONFIG,
  )

  return null
}
