import ms from 'ms.macro'
import { SupportedChainId } from '@cowprotocol/cow-sdk'

import { TokensState } from '../../state/tokens/allTokensAtom'
import { ListState } from '../../types'

const TOKENS_LISTS_UPDATER_INTERVAL = ms`6h`

export const LAST_UPDATE_TIME_KEY = (chainId: SupportedChainId) => `tokens-lists-updater:last-update-time[${chainId}]`

export const getIsTimeToUpdate = (chainId: SupportedChainId): boolean => {
  const lastUpdateTime = +(localStorage.getItem(LAST_UPDATE_TIME_KEY(chainId)) || 0)

  if (!lastUpdateTime) return true

  return Date.now() - lastUpdateTime > TOKENS_LISTS_UPDATER_INTERVAL
}

export const getFulfilledResults = (results: PromiseSettledResult<ListState>[]) => {
  return results.reduce<ListState[]>((acc, val) => {
    if (val.status === 'fulfilled') {
      acc.push(val.value)
    }

    return acc
  }, [])
}
