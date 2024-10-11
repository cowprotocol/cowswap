import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import useSWR from 'swr'

import { TokenHolder } from '../types'

export interface GetTopTokenHoldersParams {
  tokenAddress?: string
  chainId: SupportedChainId
}

export async function getTopTokenHolder({ tokenAddress, chainId }: GetTopTokenHoldersParams) {
  if (!tokenAddress) return

  return (await fetch(`${BFF_BASE_URL}/${chainId}/tokens/${tokenAddress}/topHolders`, {
    method: 'GET',
  }).then((res) => res.json())) as TokenHolder[]
}

export function useTopTokenHolders(params: GetTopTokenHoldersParams) {
  return useSWR(['topTokenHolders', params], () => getTopTokenHolder(params))
}
