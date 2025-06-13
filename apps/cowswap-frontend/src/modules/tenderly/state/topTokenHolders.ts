import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'

import { BFF_BASE_URL } from '@cowprotocol/common-const'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

export interface GetTopTokenHoldersParams {
  tokenAddress?: string
  chainId: SupportedChainId
}

export interface TokenHolder {
  address: string
  balance: string
}

// TODO: Add proper return type annotation
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export async function getTopTokenHolder({ tokenAddress, chainId }: GetTopTokenHoldersParams) {
  if (!tokenAddress) return

  return (await fetch(`${BFF_BASE_URL}/${chainId}/tokens/${tokenAddress}/topHolders`, {
    method: 'GET',
  }).then((res) => res.json())) as TokenHolder[]
}

interface CachedValue<T> {
  value: T
  timestamp: number
}

const baseTopTokenHolderAtom = atomWithStorage<Record<string, CachedValue<TokenHolder[] | undefined>>>(
  'topTokenHolders:v1',
  {},
)

export const topTokenHoldersAtom = atom(
  (get) => get(baseTopTokenHolderAtom),
  async (get, set, params: GetTopTokenHoldersParams) => {
    const key = `${params.chainId}:${params.tokenAddress?.toLowerCase()}`
    const cachedData = get(baseTopTokenHolderAtom)
    const currentTime = Date.now() / 1000

    // 1 hour in seconds
    if (cachedData[key] && currentTime - cachedData[key].timestamp <= 3600) {
      return cachedData[key].value
    }

    const newValue = await getTopTokenHolder(params)
    set(baseTopTokenHolderAtom, {
      ...cachedData,
      [key]: { value: newValue, timestamp: currentTime },
    })

    return newValue
  },
)
