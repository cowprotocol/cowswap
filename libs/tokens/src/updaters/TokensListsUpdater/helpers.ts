import ms from 'ms.macro'

import { ListState } from '../../types'

export const TOKENS_LISTS_UPDATER_INTERVAL = ms`6h`

export const getIsTimeToUpdate = (lastUpdateTime: number): boolean => {
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
