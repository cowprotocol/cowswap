import { SupportedChainId } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { GOLD_RUSH_API_BASE_URL, GOLD_RUSH_API_KEY, GOLD_RUSH_CLIENT_NETWORK_MAPPING } from '../const'
import { TokenHoldersResponse } from '../types'

export interface GetTopTokenHoldersParams {
  tokenAddress?: string
  chainId: SupportedChainId
}

export async function getTopTokenHolder({ tokenAddress, chainId }: GetTopTokenHoldersParams) {
  if (!tokenAddress) return

  const response = (await fetch(
    `${GOLD_RUSH_API_BASE_URL}/v1/${GOLD_RUSH_CLIENT_NETWORK_MAPPING[chainId]}/tokens/${tokenAddress}/token_holders_v2/`,
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${GOLD_RUSH_API_KEY}` },
    },
  ).then((res) => res.json())) as TokenHoldersResponse

  if (response.error) return

  return response.data.items
}

export function useTopTokenHolders(params: GetTopTokenHoldersParams) {
  return useSWR(['topTokenHolders', params], () => getTopTokenHolder(params))
}
